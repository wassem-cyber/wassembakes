(function () {
  const APPSCRIPT_URL = "https://us-central1-wassembakes-app.cloudfunctions.net/subscribe";

  // Comments backend — a Firebase HTTP Cloud Function (see
  // .claude/comments-backend/ for the source + deploy steps). GET ?slug=
  // returns approved comments; POST publishes one immediately (and emails a
  // heads-up to the admin).
  // Until the function is deployed the widget degrades gracefully (shows the
  // form + an empty state; submitting shows a friendly "try later" message).
  const COMMENTS_URL = "https://us-central1-wassembakes-app.cloudfunctions.net/comments";

  // "Email this recipe" mailer. Deploy .claude/recipe-mailer.gs as a Google
  // Apps Script web app (Deploy → New deployment → Web app, "Anyone" access)
  // and paste its /exec URL here. Until then, the email button shows a friendly
  // "not set up yet" message instead of failing.
  const RECIPE_MAIL_URL = "https://script.google.com/macros/s/AKfycbwA2H-9Uhsmd9tGBkIBpzDiAyft3qpmD_xfnyUIIuy7D6g8IMsrslVg_wWp8UkJN7B5/exec";

  const PRINT_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="6" y="13" width="12" height="8" rx="1"/></svg>';
  const EMAIL_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7.5 9 6 9-6"/></svg>';
  const PINTEREST_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345c-.091.378-.293 1.194-.333 1.361-.052.22-.174.266-.402.16-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>';

  const CURRENT_SLUG =
    document.querySelector('meta[name="post-slug"]')?.content || "";

  async function loadPosts() {
    try {
      const res = await fetch("posts.json", { cache: "no-cache" });
      if (!res.ok) throw new Error("fetch failed");
      const posts = await res.json();
      return posts.sort((a, b) => b.date.localeCompare(a.date));
    } catch (e) {
      return [];
    }
  }

  const TAG_SECTIONS = [
    { type: "tag", tag: "Recipes" },
    { type: "tag", tag: "Baking Tips" },
    { type: "group", label: "Specialty Baking", tags: ["Gluten-Free", "Vegan"] },
    { type: "tag", tag: "Health & Wellness" },
  ];

  const TAG_BADGE_DISPLAY = {
    "Vegan": "Vegan",
    "Gluten-Free": "Gluten-Free",
    "Health & Wellness": "Health Focused",
  };

  function recipeTagSet(p) {
    return new Set([...(p.tags || []), ...(p.recipeTags || [])]);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  function imgVariants(image, title, sizes) {
    const dot = image.lastIndexOf(".");
    const base = image.substring(0, dot);
    const ext = image.substring(dot);
    const srcset = [480, 800, 1200]
      .map((w) => `images/${base}-${w}w${ext} ${w}w`)
      .join(", ");
    return `src="images/${base}-800w${ext}" srcset="${srcset}" sizes="${sizes}" alt="${title}"`;
  }

  function renderTagBadges(p) {
    const set = recipeTagSet(p);
    const matched = Object.keys(TAG_BADGE_DISPLAY).filter((t) => set.has(t));
    if (!matched.length) return "";
    return `<div class="post-card-badges">${matched
      .map(
        (t) =>
          `<span class="post-card-badge">${TAG_BADGE_DISPLAY[t]}</span>`
      )
      .join("")}</div>`;
  }

  function renderCard(p, cardOptions) {
    const badges =
      cardOptions && cardOptions.showTags ? renderTagBadges(p) : "";
    const sizes =
      (cardOptions && cardOptions.sizes) || "(max-width: 600px) 100vw, 400px";
    return `
      <li class="post-card">
        <a href="${p.slug}">
          <div class="post-card-image">${p.image ? `<img ${imgVariants(p.image, p.title, sizes)} loading="lazy" decoding="async">` : ""}</div>
          <div class="post-card-content">
            <div class="post-card-date">${p.dateDisplay}</div>
            <h2>${p.title}</h2>
            ${badges}
            <p class="post-card-excerpt">${p.excerpt}</p>
          </div>
        </a>
      </li>`;
  }

  function renderSection(title, posts, options) {
    if (!posts.length) return "";
    options = options || {};
    const titleEl = options.small
      ? `<h3 class="posts-subsection-title">${title}</h3>`
      : `<h2 class="posts-section-title">${title}</h2>`;
    const seeAll = options.seeAll
      ? `<a class="posts-section-link" href="${options.seeAll.href}">${options.seeAll.label} &rarr;</a>`
      : "";
    const heading = seeAll
      ? `<div class="posts-section-head">${titleEl}${seeAll}</div>`
      : titleEl;
    const filterLinks = options.filterLinks
      ? `<div class="posts-section-filters">${options.filterLinks
          .map(
            (f) =>
              `<a class="recipe-filter" href="${f.href}">${f.label}</a>`
          )
          .join("")}</div>`
      : "";
    const extra = options.className ? " " + options.className : "";
    if (options.grid) {
      return `
      <section class="posts-section is-grid${extra}">
        ${heading}
        ${filterLinks}
        <ul class="posts">${posts.map((p) => renderCard(p, { showTags: !!options.showTags })).join("")}</ul>
      </section>`;
    }
    const sectionClass = (options.small ? "posts-section is-sub" : "posts-section") + extra;
    const arrowLeft = `<button class="posts-arrow left" type="button" aria-label="Scroll left" data-scroll="-1"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>`;
    const arrowRight = `<button class="posts-arrow right" type="button" aria-label="Scroll right" data-scroll="1"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>`;
    return `
      <section class="${sectionClass}">
        ${heading}
        ${filterLinks}
        <div class="posts-row">
          ${arrowLeft}
          <ul class="posts">${posts.map((p) => renderCard(p, { showTags: !!options.showTags })).join("")}</ul>
          ${arrowRight}
        </div>
      </section>`;
  }

  function renderGroup(label, tagSections) {
    const inner = tagSections.filter((s) => s).join("");
    if (!inner) return "";
    return `<div class="posts-group"><h2 class="posts-group-title">${label}</h2>${inner}</div>`;
  }

  function pickRandom(arr, n) {
    const shuffled = arr.slice().sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  }

  function renderHeroSection(posts) {
    if (!posts.length) return "";
    const newest = posts[0];
    const featured = pickRandom(posts.slice(1), 2);
    const newColumn = `
      <section class="posts-hero-col is-new">
        <h2 class="posts-section-title">New</h2>
        <ul class="posts is-stack">${renderCard(newest, { sizes: "(max-width: 800px) 100vw, 560px" })}</ul>
      </section>`;
    const featuredColumn = featured.length
      ? `
      <section class="posts-hero-col is-featured">
        <h2 class="posts-section-title">Featured</h2>
        <ul class="posts is-stack">${featured.map(renderCard).join("")}</ul>
      </section>`
      : "";
    return `<div class="posts-hero">${newColumn}${featuredColumn}</div>`;
  }

  function wirePostsArrows() {
    document.querySelectorAll(".posts-row").forEach((row) => {
      const ul = row.querySelector(".posts");
      if (!ul) return;
      const left = row.querySelector(".posts-arrow.left");
      const right = row.querySelector(".posts-arrow.right");
      function update() {
        const overflow = ul.scrollWidth - ul.clientWidth;
        if (overflow <= 1) {
          if (left) left.classList.add("hidden");
          if (right) right.classList.add("hidden");
          return;
        }
        if (left) {
          left.classList.remove("hidden");
          left.disabled = ul.scrollLeft <= 0;
        }
        if (right) {
          right.classList.remove("hidden");
          right.disabled = ul.scrollLeft >= overflow - 1;
        }
      }
      [left, right].forEach((btn) => {
        if (!btn) return;
        btn.addEventListener("click", () => {
          const dir = parseInt(btn.dataset.scroll, 10);
          ul.scrollBy({ left: dir * ul.clientWidth * 0.8, behavior: "smooth" });
        });
      });
      ul.addEventListener("scroll", update);
      window.addEventListener("resize", update);
      update();
    });
  }

  function renderIndexList(posts) {
    const el = document.querySelector("[data-posts-list]");
    if (!el) return;
    if (!posts.length) {
      el.innerHTML =
        '<ul class="posts"><li class="posts-empty">First post coming soon.</li></ul>';
      return;
    }

    function showCurated() {
      renderCurated(el, posts);
      wirePostsArrows();
    }

    function showSearch(query) {
      const q = query.toLowerCase();
      const matches = posts.filter((p) => {
        const haystack = [
          p.title,
          p.excerpt,
          ...(p.tags || []),
          ...(p.recipeTags || []),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
      const n = matches.length;
      const summary = `<div class="posts-search-summary">${n} result${
        n === 1 ? "" : "s"
      } for &ldquo;${escapeHtml(query)}&rdquo;</div>`;
      if (!n) {
        el.innerHTML =
          summary +
          '<ul class="posts"><li class="posts-empty">No posts match your search.</li></ul>';
        return;
      }
      el.innerHTML =
        summary +
        `<section class="posts-section is-grid"><ul class="posts">${matches
          .map((p) => renderCard(p))
          .join("")}</ul></section>`;
    }

    const input = document.querySelector("[data-search-input]");
    if (input) {
      const clearBtn = document.querySelector("[data-search-clear]");
      const form = document.querySelector("[data-blog-search]");
      function apply() {
        const q = input.value.trim();
        if (clearBtn) clearBtn.hidden = !q;
        if (q) showSearch(q);
        else showCurated();
      }
      input.addEventListener("input", apply);
      if (form) form.addEventListener("submit", (e) => e.preventDefault());
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          input.value = "";
          apply();
          input.focus();
        });
      }
    }

    showCurated();
  }

  function renderCurated(el, posts) {
    const tagSections = TAG_SECTIONS.map((item) => {
      if (item.type === "tag") {
        const opts =
          item.tag === "Recipes"
            ? {
                seeAll: { href: "recipes.html", label: "See all recipes" },
                className: "is-featured",
                showTags: true,
                filterLinks: [
                  { label: "Vegan", href: "recipes.html?filter=Vegan" },
                  { label: "Gluten-Free", href: "recipes.html?filter=Gluten-Free" },
                  {
                    label: "Health Focused",
                    href:
                      "recipes.html?filter=" +
                      encodeURIComponent("Health & Wellness"),
                  },
                ],
              }
            : undefined;
        return renderSection(
          item.tag,
          posts.filter((p) => (p.tags || []).includes(item.tag)),
          opts
        );
      }
      if (item.type === "group") {
        const subs = item.tags.map((t) =>
          renderSection(
            t,
            posts.filter((p) => (p.tags || []).includes(t)),
            { small: true }
          )
        );
        return renderGroup(item.label, subs);
      }
      return "";
    }).join("");
    const heroSection = renderHeroSection(posts);
    el.innerHTML = heroSection + tagSections + '<div data-all-posts></div>';

    const allEl = el.querySelector("[data-all-posts]");
    const PAGE_SIZE = 12;
    const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
    let currentPage = 1;

    function renderPagination() {
      if (totalPages <= 1) return "";
      let html = '<div class="posts-pagination">';
      const prevDisabled = currentPage === 1 ? " disabled" : "";
      html += `<button class="posts-page-btn posts-page-nav" type="button" data-page="${currentPage - 1}" aria-label="Previous page"${prevDisabled}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>`;
      for (let i = 1; i <= totalPages; i++) {
        const active = i === currentPage ? " is-active" : "";
        html += `<button class="posts-page-num${active}" type="button" data-page="${i}">${i}</button>`;
      }
      const nextDisabled = currentPage === totalPages ? " disabled" : "";
      html += `<button class="posts-page-btn posts-page-nav" type="button" data-page="${currentPage + 1}" aria-label="Next page"${nextDisabled}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>`;
      html += "</div>";
      return html;
    }

    function renderAll() {
      const start = (currentPage - 1) * PAGE_SIZE;
      const slice = posts.slice(start, start + PAGE_SIZE);
      allEl.innerHTML =
        renderSection("All Posts", slice, { grid: true }) + renderPagination();
      allEl.querySelectorAll("[data-page]").forEach((btn) => {
        btn.addEventListener("click", () => {
          currentPage = parseInt(btn.dataset.page, 10);
          renderAll();
          allEl.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }

    renderAll();
  }

  function renderRecipesList(posts) {
    const el = document.querySelector("[data-recipes-list]");
    if (!el) return;
    const recipes = posts.filter((p) => (p.tags || []).includes("Recipes"));
    let activeFilter = "all";
    let searchQuery = "";

    const params = new URLSearchParams(window.location.search);
    const requestedFilter = params.get("filter");
    if (requestedFilter) {
      const match = document.querySelector(
        `[data-recipe-filters] .recipe-filter[data-filter="${requestedFilter.replace(/"/g, '\\"')}"]`
      );
      if (match) {
        activeFilter = requestedFilter;
        document
          .querySelectorAll("[data-recipe-filters] .recipe-filter")
          .forEach((b) => b.classList.toggle("is-active", b === match));
      }
    }

    function render() {
      let filtered =
        activeFilter === "all"
          ? recipes
          : recipes.filter((p) => recipeTagSet(p).has(activeFilter));
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter((p) => {
          const haystack = [
            p.title,
            p.excerpt,
            ...(p.tags || []),
            ...(p.recipeTags || []),
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        });
      }
      if (!filtered.length) {
        const msg = searchQuery
          ? "No recipes match your search."
          : "No recipes match this filter yet.";
        el.innerHTML = `<ul class="posts"><li class="posts-empty">${msg}</li></ul>`;
        return;
      }
      el.innerHTML = `
        <section class="posts-section is-grid">
          <ul class="posts">${filtered.map((p) => renderCard(p, { showTags: true })).join("")}</ul>
        </section>`;
    }

    document.querySelectorAll("[data-recipe-filters] .recipe-filter").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeFilter = btn.dataset.filter;
        document
          .querySelectorAll("[data-recipe-filters] .recipe-filter")
          .forEach((b) => b.classList.toggle("is-active", b === btn));
        render();
      });
    });

    const input = document.querySelector("[data-search-input]");
    if (input) {
      const clearBtn = document.querySelector("[data-search-clear]");
      const form = document.querySelector("[data-blog-search]");
      input.addEventListener("input", () => {
        searchQuery = input.value.trim();
        if (clearBtn) clearBtn.hidden = !searchQuery;
        render();
      });
      if (form) form.addEventListener("submit", (e) => e.preventDefault());
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          input.value = "";
          searchQuery = "";
          clearBtn.hidden = true;
          render();
          input.focus();
        });
      }
    }

    render();
  }

  function renderPostTags(posts) {
    const el = document.querySelector("[data-post-tags]");
    if (!el) return;
    const post = posts.find((p) => p.slug === CURRENT_SLUG);
    if (!post || !post.tags || !post.tags.length) {
      el.remove();
      return;
    }
    el.innerHTML = post.tags
      .map((t) => `<span class="post-tag">${t}</span>`)
      .join("");
  }

  function renderSidebarLatest(posts) {
    const block = document.querySelector("[data-latest-list]")?.closest(".sb-block");
    if (!block) return;
    const others = posts.filter((p) => p.slug !== CURRENT_SLUG).slice(0, 4);
    if (!others.length) {
      block.remove();
      return;
    }
    const [feat, ...rest] = others;
    const featuredHtml = `
      <a class="sb-latest-feature" href="${feat.slug}">
        ${feat.image ? `<img class="sb-latest-feature-img" ${imgVariants(feat.image, feat.title, "(max-width: 600px) 100vw, 600px")} loading="lazy">` : ""}
        <div class="sb-latest-feature-text">
          <span class="sb-latest-date">${feat.dateDisplay}</span>
          <span class="sb-latest-feature-title">${feat.title}</span>
        </div>
      </a>`;
    const restHtml = rest.length
      ? `<ul class="sb-latest-list">${rest
          .map(
            (p) => `
        <li>
          <a href="${p.slug}">
            ${p.image ? `<img class="sb-latest-img" ${imgVariants(p.image, p.title, "(max-width: 600px) 50vw, 200px")} loading="lazy">` : ""}
            <div class="sb-latest-text">
              <span class="sb-latest-date">${p.dateDisplay}</span>
              <span class="sb-latest-title">${p.title}</span>
            </div>
          </a>
        </li>`
          )
          .join("")}</ul>`
      : "";
    const label = block.querySelector(".sb-label");
    block.innerHTML = (label ? label.outerHTML : "") + featuredHtml + restHtml;
  }

  function wireNewsletterForm() {
    const form = document.querySelector("[data-newsletter-form]");
    if (!form) return;
    const msg = form.querySelector(".sb-newsletter-msg");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!APPSCRIPT_URL) {
        msg.textContent = "Newsletter launching soon — check back.";
        return;
      }
      const email = form.querySelector('input[type="email"]').value;
      msg.textContent = "Signing you up…";
      fetch(APPSCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "email=" + encodeURIComponent(email),
      })
        .then(() => {
          msg.textContent = "Thanks — you're in.";
          form.reset();
        })
        .catch(() => {
          msg.textContent = "Something went wrong. Try again.";
        });
    });
  }

  // --- Comments --------------------------------------------------------------

  function formatCommentDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function renderComment(c) {
    const body = escapeHtml(c.body || "").replace(/\n/g, "<br>");
    const date = formatCommentDate(c.createdAt);
    return `
      <li class="comment">
        <div class="comment-head">
          <span class="comment-author">${escapeHtml(c.name || "Anonymous")}</span>
          ${date ? `<span class="comment-date">${date}</span>` : ""}
        </div>
        <div class="comment-body">${body}</div>
      </li>`;
  }

  function renderCommentsList(listEl, titleEl, comments) {
    const n = comments.length;
    if (titleEl) {
      titleEl.textContent = n ? `Comments (${n})` : "Comments";
    }
    if (!n) {
      listEl.innerHTML =
        '<li class="comments-empty">No comments yet — start the conversation.</li>';
      return;
    }
    listEl.innerHTML = comments.map(renderComment).join("");
  }

  async function loadComments(listEl, titleEl) {
    try {
      const res = await fetch(
        COMMENTS_URL + "?slug=" + encodeURIComponent(CURRENT_SLUG),
        { cache: "no-cache" }
      );
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const comments = Array.isArray(data.comments) ? data.comments : [];
      renderCommentsList(listEl, titleEl, comments);
    } catch (e) {
      // Backend not reachable yet — show an inviting empty state, not an error.
      renderCommentsList(listEl, titleEl, []);
    }
  }

  function wireComments() {
    if (!CURRENT_SLUG) return; // posts only, never listing pages
    const article = document.querySelector("article.post");
    if (!article) return;

    const section = document.createElement("section");
    section.className = "comments";
    section.id = "comments";
    section.innerHTML =
      '<h2 class="comments-title">Comments</h2>' +
      '<ul class="comments-list" data-comments-list></ul>' +
      '<form class="comment-form" data-comment-form novalidate>' +
        '<h3 class="comment-form-title">Leave a comment</h3>' +
        '<div class="comment-form-row">' +
          '<input type="text" name="name" placeholder="Your name" maxlength="80" autocomplete="name" required>' +
          '<input type="email" name="email" placeholder="Email (optional, never shown)" maxlength="120" autocomplete="email">' +
        "</div>" +
        '<textarea name="body" placeholder="Share your thoughts…" rows="4" maxlength="2000" required></textarea>' +
        // Honeypot: real people leave this empty; bots tend to fill every field.
        '<div class="comment-hp" aria-hidden="true">' +
          '<label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>' +
        "</div>" +
        '<div class="comment-form-actions">' +
          '<button type="submit">Post comment</button>' +
          '<span class="comment-form-msg" data-comment-msg></span>' +
        "</div>" +
      "</form>";

    article.appendChild(section);

    const listEl = section.querySelector("[data-comments-list]");
    const titleEl = section.querySelector(".comments-title");
    const form = section.querySelector("[data-comment-form]");
    const msg = section.querySelector("[data-comment-msg]");
    const submitBtn = form.querySelector('button[type="submit"]');

    loadComments(listEl, titleEl);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = form.querySelector('input[name="name"]').value.trim();
      const email = form.querySelector('input[name="email"]').value.trim();
      const body = form.querySelector('textarea[name="body"]').value.trim();
      const website = form.querySelector('input[name="website"]').value; // honeypot

      if (!name || !body) {
        msg.textContent = "Please add your name and a comment.";
        return;
      }

      // Bot filled the honeypot — pretend success, send nothing.
      if (website) {
        form.reset();
        msg.textContent = "Thanks — your comment has been posted.";
        return;
      }

      submitBtn.disabled = true;
      msg.textContent = "Posting…";

      fetch(COMMENTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: CURRENT_SLUG,
          name: name,
          email: email,
          body: body,
          website: website,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("bad response");
          return res.json();
        })
        .then((data) => {
          if (!data || !data.ok) throw new Error("not ok");
          form.reset();
          if (data.held) {
            // Held by the link/profanity filter — awaits manual approval.
            msg.textContent = "Thanks — your comment will appear after review.";
          } else {
            msg.textContent = "Thanks — your comment has been posted.";
            // Published immediately, so refresh the list to show it.
            loadComments(listEl, titleEl);
          }
        })
        .catch(() => {
          msg.textContent =
            "Sorry, we couldn't post that just now. Please try again later.";
        })
        .finally(() => {
          submitBtn.disabled = false;
        });
    });
  }

  function alignSidebarToTitle() {
    const sidebar = document.querySelector(".sidebar");
    const title = document.querySelector(".post-header h1");
    const hero = document.querySelector(".post-hero");
    if (!sidebar || !title) return;

    function update() {
      sidebar.style.marginTop = "0px";
      if (window.innerWidth <= 1000) return;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const titleTop = title.getBoundingClientRect().top;
      const sidebarTop = sidebar.getBoundingClientRect().top;
      sidebar.style.marginTop = Math.max(0, titleTop - sidebarTop - 20 * rem) + "px";
    }

    update();
    if (hero && !hero.complete) hero.addEventListener("load", update);
    window.addEventListener("resize", update);
  }

  // --- Save This Recipe: print + email ---------------------------------------

  function recipePrintDoc(innerHtml, title) {
    const css =
      "*{box-sizing:border-box;}" +
      "body{font-family:Georgia,'Times New Roman',serif;color:#1A1714;margin:0;padding:2rem;line-height:1.55;}" +
      ".print-wrap{max-width:720px;margin:0 auto;}" +
      ".recipe-card-title{font-size:1.9rem;margin:0 0 .6rem;}" +
      ".recipe-card-meta{display:flex;gap:2.5rem;list-style:none;margin:0 0 1.2rem;padding:0;flex-wrap:wrap;}" +
      ".recipe-meta-label{font-size:.68rem;text-transform:uppercase;letter-spacing:.12em;margin:0;opacity:.65;}" +
      ".recipe-meta-value{margin:.1rem 0 0;font-weight:700;font-size:1.15rem;}" +
      "picture{display:block;}" +
      "img.recipe-card-hero{max-width:340px;width:100%;height:auto;border-radius:6px;margin:0 0 1.2rem;}" +
      "h3{margin:1.3rem 0 .4rem;font-size:1.1rem;}" +
      "ul,ol{margin:0 0 1rem 1.25rem;padding:0;}" +
      "li{margin-bottom:.35rem;}" +
      ".print-source{margin-top:1.5rem;font-size:.8rem;color:#888;border-top:1px solid #ddd;padding-top:.8rem;}" +
      "@media print{body{padding:0;}a{color:inherit;text-decoration:none;}img.recipe-card-hero{max-width:300px;}}";
    return (
      '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
      "<title>" + escapeHtml(title) + "</title>" +
      '<base href="' + location.href + '">' +
      "<style>" + css + "</style></head><body><div class=\"print-wrap\">" +
      innerHtml +
      '<p class="print-source">Recipe from wassembakes.com &middot; ' + escapeHtml(location.href) + "</p>" +
      "</div><scr" + "ipt>window.onload=function(){setTimeout(function(){window.focus();window.print();},350);};</scr" + "ipt>" +
      "</body></html>"
    );
  }

  function recipeCardClone(card) {
    const clone = card.cloneNode(true);
    clone.querySelectorAll("[data-recipe-save]").forEach((n) => n.remove());
    return clone;
  }

  // Flatten <picture> to a single absolute-URL <img> so it renders in email clients.
  function recipeEmailHtml(card) {
    const clone = recipeCardClone(card);
    clone.querySelectorAll("picture").forEach((pic) => {
      const img = pic.querySelector("img");
      if (!img) { pic.remove(); return; }
      const abs = new URL(img.getAttribute("src"), location.href).href;
      const replacement = document.createElement("img");
      replacement.src = abs;
      replacement.alt = img.getAttribute("alt") || "";
      replacement.setAttribute("width", "320");
      replacement.style.cssText = "max-width:320px;width:100%;height:auto;border-radius:6px;";
      pic.replaceWith(replacement);
    });
    clone.querySelectorAll("img[srcset]").forEach((im) => im.removeAttribute("srcset"));
    return clone.innerHTML;
  }

  let recipeModalCard = null;
  let recipeModalTitle = "";

  function ensureRecipeEmailModal() {
    let overlay = document.querySelector("[data-recipe-modal]");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.className = "recipe-modal-overlay";
    overlay.setAttribute("data-recipe-modal", "");
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="recipe-modal" role="dialog" aria-modal="true" aria-labelledby="recipeModalTitle">' +
        '<button type="button" class="recipe-modal-close" data-recipe-modal-close aria-label="Close">&times;</button>' +
        '<h3 id="recipeModalTitle">Email this recipe</h3>' +
        "<p>Enter your email and we&rsquo;ll send the full recipe plus a link to the post.</p>" +
        '<form class="email-form recipe-modal-form" data-recipe-email-form>' +
          '<input type="email" placeholder="your@email.com" required>' +
          '<label class="recipe-modal-check"><input type="checkbox" data-recipe-newsletter checked> Join the Wassem Bakes newsletter</label>' +
          "<button type=\"submit\">Send Recipe</button>" +
        "</form>" +
        '<div class="recipe-modal-msg" data-recipe-modal-msg></div>' +
      "</div>";
    document.body.appendChild(overlay);

    const form = overlay.querySelector("[data-recipe-email-form]");
    const msg = overlay.querySelector("[data-recipe-modal-msg]");
    function close() {
      overlay.classList.remove("show");
      setTimeout(() => { overlay.hidden = true; }, 300);
    }
    overlay.querySelector("[data-recipe-modal-close]").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !overlay.hidden) close();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!recipeModalCard) return;
      const email = form.querySelector('input[type="email"]').value;
      if (!RECIPE_MAIL_URL) {
        msg.textContent = "Email sending isn’t set up yet — check back soon.";
        return;
      }
      msg.textContent = "Sending…";
      // Optional newsletter opt-in — same Google Sheet as the newsletter form.
      const wantsNewsletter = form.querySelector("[data-recipe-newsletter]")?.checked;
      if (wantsNewsletter && APPSCRIPT_URL) {
        fetch(APPSCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "email=" + encodeURIComponent(email) + "&source=recipe-email",
        }).catch(() => {});
      }
      fetch(RECIPE_MAIL_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:
          "email=" + encodeURIComponent(email) +
          "&title=" + encodeURIComponent(recipeModalTitle) +
          "&url=" + encodeURIComponent(location.href) +
          "&html=" + encodeURIComponent(recipeEmailHtml(recipeModalCard)),
      })
        .then(() => {
          msg.textContent = "Sent! Check your inbox.";
          form.reset();
          setTimeout(close, 1600);
        })
        .catch(() => {
          msg.textContent = "Something went wrong. Try again.";
        });
    });

    overlay._close = close;
    return overlay;
  }

  function openRecipeEmailModal(card, title) {
    recipeModalCard = card;
    recipeModalTitle = title;
    const overlay = ensureRecipeEmailModal();
    const form = overlay.querySelector("[data-recipe-email-form]");
    const msg = overlay.querySelector("[data-recipe-modal-msg]");
    msg.textContent = "";
    form.reset();
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("show"));
    setTimeout(() => form.querySelector('input[type="email"]').focus(), 50);
  }

  function wireRecipeSave() {
    const card = document.querySelector(".recipe-card");
    if (!card) return;

    const save = document.createElement("div");
    save.className = "recipe-save";
    save.setAttribute("data-recipe-save", "");
    save.innerHTML =
      '<span class="recipe-save-label">Save This Recipe</span>' +
      '<div class="recipe-save-actions">' +
        '<button type="button" class="recipe-save-btn" data-recipe-print aria-label="Print recipe">' +
          PRINT_ICON + "</button>" +
        '<button type="button" class="recipe-save-btn" data-recipe-email aria-label="Email recipe">' +
          EMAIL_ICON + "</button>" +
        '<button type="button" class="recipe-save-btn is-pinterest" data-recipe-pin aria-label="Save recipe to Pinterest">' +
          PINTEREST_ICON + "</button>" +
      "</div>";

    // Place directly below the recipe card image (falls back to meta, then top).
    const hero = card.querySelector(".recipe-card-hero");
    const anchor =
      (hero && hero.closest("picture")) ||
      hero ||
      card.querySelector(".recipe-card-meta");
    if (anchor && card.contains(anchor)) {
      anchor.insertAdjacentElement("afterend", save);
    } else {
      card.insertBefore(save, card.firstChild);
    }

    const title = (
      card.querySelector(".recipe-card-title")?.textContent || document.title
    ).trim();

    save.querySelector("[data-recipe-print]").addEventListener("click", function () {
      const clone = recipeCardClone(card);
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.open();
      win.document.write(recipePrintDoc(clone.innerHTML, title));
      win.document.close();
    });

    save.querySelector("[data-recipe-email]").addEventListener("click", function () {
      openRecipeEmailModal(card, title);
    });

    save.querySelector("[data-recipe-pin]").addEventListener("click", function () {
      const heroImg = card.querySelector(".recipe-card-hero");
      let media = "";
      if (heroImg) {
        const src = (heroImg.getAttribute("src") || "").replace(/-800w\./, "-1200w.");
        if (src) media = new URL(src, location.href).href;
      }
      const pinUrl =
        "https://www.pinterest.com/pin/create/button/?url=" +
        encodeURIComponent(location.href) +
        "&media=" + encodeURIComponent(media) +
        "&description=" + encodeURIComponent(title);
      window.open(pinUrl, "_blank", "noopener,noreferrer,width=750,height=600");
    });
  }

  async function init() {
    const posts = await loadPosts();
    renderIndexList(posts);
    renderRecipesList(posts);
    renderSidebarLatest(posts);
    renderPostTags(posts);
    wireNewsletterForm();
    wireRecipeSave();
    wireComments();
    alignSidebarToTitle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
