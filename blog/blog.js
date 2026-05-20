(function () {
  const APPSCRIPT_URL = "https://script.google.com/macros/s/AKfycbyloIXcsvJwHgj689X7_QjBXwpQ5CiMLk1suHf66tRR3-SHzC399UL0ele7VbwGbZgcfQ/exec";

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
    return `
      <li class="post-card">
        <a href="${p.slug}">
          <div class="post-card-image">${p.image ? `<img ${imgVariants(p.image, p.title, "(max-width: 600px) 100vw, 400px")} loading="lazy" decoding="async">` : ""}</div>
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
        <ul class="posts is-stack">${renderCard(newest)}</ul>
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

  async function init() {
    const posts = await loadPosts();
    renderIndexList(posts);
    renderRecipesList(posts);
    renderSidebarLatest(posts);
    renderPostTags(posts);
    wireNewsletterForm();
    alignSidebarToTitle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
