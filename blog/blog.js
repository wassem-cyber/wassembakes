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

  function renderCard(p) {
    return `
      <li class="post-card">
        <a href="${p.slug}.html">
          <div class="post-card-image">${p.image ? `<img src="images/${p.image}" alt="" loading="lazy" decoding="async">` : ""}</div>
          <div class="post-card-content">
            <div class="post-card-date">${p.dateDisplay}</div>
            <h2>${p.title}</h2>
            <p class="post-card-excerpt">${p.excerpt}</p>
          </div>
        </a>
      </li>`;
  }

  function renderSection(title, posts, options) {
    if (!posts.length) return "";
    options = options || {};
    const heading = options.small
      ? `<h3 class="posts-subsection-title">${title}</h3>`
      : `<h2 class="posts-section-title">${title}</h2>`;
    if (options.grid) {
      return `
      <section class="posts-section is-grid">
        ${heading}
        <ul class="posts">${posts.map(renderCard).join("")}</ul>
      </section>`;
    }
    const sectionClass = options.small ? "posts-section is-sub" : "posts-section";
    const arrowLeft = `<button class="posts-arrow left" type="button" aria-label="Scroll left" data-scroll="-1"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>`;
    const arrowRight = `<button class="posts-arrow right" type="button" aria-label="Scroll right" data-scroll="1"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>`;
    return `
      <section class="${sectionClass}">
        ${heading}
        <div class="posts-row">
          ${arrowLeft}
          <ul class="posts">${posts.map(renderCard).join("")}</ul>
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
    const tagSections = TAG_SECTIONS.map((item) => {
      if (item.type === "tag") {
        return renderSection(
          item.tag,
          posts.filter((p) => (p.tags || []).includes(item.tag))
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
    const allSection = renderSection("All Posts", posts, { grid: true });
    el.innerHTML = heroSection + tagSections + allSection;
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
    const el = document.querySelector("[data-latest-list]");
    if (!el) return;
    const others = posts.filter((p) => p.slug !== CURRENT_SLUG).slice(0, 3);
    if (!others.length) {
      el.closest(".sb-block")?.remove();
      return;
    }
    el.innerHTML = others
      .map(
        (p) => `
      <li>
        <a href="${p.slug}.html">
          ${p.image ? `<img class="sb-latest-img" src="images/${p.image}" alt="" loading="lazy">` : ""}
          <div class="sb-latest-text">
            <span class="sb-latest-date">${p.dateDisplay}</span>
            <span class="sb-latest-title">${p.title}</span>
          </div>
        </a>
      </li>`
      )
      .join("");
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
    wirePostsArrows();
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
