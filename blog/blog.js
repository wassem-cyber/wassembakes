(function () {
  const APPSCRIPT_URL = "https://script.google.com/macros/s/AKfycbyloIXcsvJwHgj689X7_QjBXwpQ5CiMLk1suHf66tRR3-SHzC399UL0ele7VbwGbZgcfQ/exec";

  const CURRENT_SLUG =
    document.querySelector('meta[name="post-slug"]')?.content || "";

  async function loadPosts() {
    try {
      const res = await fetch("/blog/posts.json", { cache: "no-cache" });
      if (!res.ok) throw new Error("fetch failed");
      const posts = await res.json();
      return posts.sort((a, b) => b.date.localeCompare(a.date));
    } catch (e) {
      return [];
    }
  }

  function renderIndexList(posts) {
    const el = document.querySelector("[data-posts-list]");
    if (!el) return;
    if (!posts.length) {
      el.innerHTML =
        '<li class="posts-empty">First post coming soon.</li>';
      return;
    }
    el.innerHTML = posts
      .map(
        (p) => `
      <li class="post-card">
        <a href="/blog/${p.slug}.html">
          <div class="post-card-date">${p.dateDisplay}</div>
          <div>
            <h2>${p.title}</h2>
            <p class="post-card-excerpt">${p.excerpt}</p>
          </div>
        </a>
      </li>`
      )
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
        <a href="/blog/${p.slug}.html">
          ${p.image ? `<img class="sb-latest-img" src="/blog/images/${p.image}" alt="" loading="lazy">` : ""}
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

  async function init() {
    const posts = await loadPosts();
    renderIndexList(posts);
    renderSidebarLatest(posts);
    wireNewsletterForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
