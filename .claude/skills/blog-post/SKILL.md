---
name: blog-post
description: Write and publish a new blog post for wassembakes.com. Invoke when the user asks to draft, write, or publish a blog post. Produces a static HTML file under /blog/, updates blog/posts.json (which drives the index and sidebar widgets automatically), and follows the site's voice and brand rules.
---

# Blog Post Skill

Voice and brand rules come from the `sensible-brand` skill — read it first if not loaded this session.

## Publishing architecture

- Each post = one standalone HTML file at `blog/<slug>.html`
- `blog/posts.json` is the source of truth. The blog index (`blog/index.html`) and every post's sidebar "Latest posts" widget auto-render from it via `blog/blog.js`.
- Shared styles live in `blog/blog.css`.
- After creating a new post, you MUST add an entry to `posts.json` or it won't appear anywhere.

## Post file template

Copy exactly. Replace `{{placeholders}}`. Keep every class, attribute, and wrapper.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{title}} — Wassem Bakes</title>
<meta name="description" content="{{excerpt}}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90' font-family='Georgia,serif' font-style='italic' font-weight='900' fill='%23FF8F1C'%3Ew%3C/text%3E%3C/svg%3E">
<meta property="og:type" content="article">
<meta property="og:title" content="{{title}}">
<meta property="og:description" content="{{excerpt}}">
<meta property="og:image" content="https://wassembakes.com/blog/images/{{slug}}.jpg">
<meta property="og:url" content="https://wassembakes.com/blog/{{slug}}.html">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://wassembakes.com/blog/images/{{slug}}.jpg">
<meta name="article:published_time" content="{{YYYY-MM-DD}}">
<meta name="post-slug" content="{{slug}}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,900;1,9..144,300;1,9..144,400&family=Inter+Tight:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="blog.css">
</head>
<body>

<nav>
  <a href="/" class="logo">wassem bakes</a>
  <div class="nav-links">
    <a href="/#reels">Work</a>
    <a href="/blog/">Blog</a>
    <a href="/#press">Press</a>
    <a href="/#contact">Contact</a>
  </div>
</nav>

<div class="post-layout">

<article class="post">
  <div class="post-meta">{{Month DD, YYYY}} &middot; {{N}} min read</div>
  <h1>{{title}}</h1>
  <p class="excerpt">{{excerpt}}</p>

  <img class="post-hero" src="images/{{slug}}.jpg" alt="{{alt text}}" fetchpriority="high" decoding="async" onerror="this.style.display='none'">

  <div class="post-body">
    {{body paragraphs and headings}}
  </div>

  <div class="post-footer">
    <!-- Optional: product CTA at bottom of post. Delete the whole block if not promoting. -->
    <div class="product-cta">
      <div class="label">{{short label}}</div>
      <h3>{{one-line product headline}}</h3>
      <p>{{why it fits this post}}</p>
      <a class="btn" href="https://sensibleedibles.com/{{products/handle OR collections/handle}}">Shop at Sensible &rarr;</a>
    </div>
  </div>
</article>

<aside class="sidebar">
  <div class="sb-block sb-newsletter">
    <div class="sb-label">Newsletter</div>
    <h4>One email. Real techniques.</h4>
    <p>Free recipes and bakery-kitchen notes, straight to your inbox.</p>
    <form data-newsletter-form>
      <input type="email" placeholder="your@email.com" required>
      <button type="submit">Subscribe</button>
      <div class="sb-newsletter-msg"></div>
    </form>
  </div>
  <div class="sb-block sb-latest">
    <div class="sb-label">Latest posts</div>
    <ul data-latest-list></ul>
  </div>
  <!-- Optional: sidebar product CTA. Delete the whole block if not promoting. -->
  <!--
  <div class="sb-block sb-product">
    <div class="sb-label">Featured</div>
    <h4>{{product name}}</h4>
    <p>{{short pitch, 1 sentence}}</p>
    <a class="btn" href="https://sensibleedibles.com/products/{{handle}}">Shop now &rarr;</a>
  </div>
  -->
</aside>

</div>

<footer class="site-footer">
  <div class="footer-wrap">
    <div>&copy; 2026 Wassem Moarsi &middot; All rights reserved</div>
    <div><a href="https://sensiblebakery.com">Sensible Edible Bakery &rarr;</a></div>
  </div>
</footer>

<script src="blog.js" defer></script>
</body>
</html>
```

## Required fields

- **slug** — kebab-case, under 60 chars, no dates (e.g. `why-xanthan-gum-matters`)
- **title** — sentence case, under 70 chars, no clickbait
- **excerpt** — 1–2 sentences, under 160 chars. Drives meta description, social preview, AND the index/sidebar listing.
- **date** — ISO in the meta tag (`2026-04-19`), human-readable in the post-meta line ("April 19, 2026")
- **read time** — word count / 225, rounded up
- **hero image** — `blog/images/<slug>.jpg`, 1600px wide, compressed to <400KB. Missing images are hidden automatically via `onerror`, so posts still look clean without them.
- **alt text** — concrete description, don't start with "image of"

## Body structure

Semantic HTML inside `.post-body`:
- `<p>`, `<h2>`, `<h3>`, `<ul>`, `<ol>`, `<blockquote>`, `<table>`, `<code>`
- `<img src="images/..." alt="...">` for inline images (auto-styled)
- Links: full URLs; external commerce gets `target="_blank" rel="noopener"`

## Voice (from sensible-brand)

Casual, direct, authoritative — 20+ years of baking, write from that seat. No marketing speak (artisanal, curated, journey, passionate, handcrafted, elevate, unlock, empower). Specific numbers, real ratios, actual temperatures. Show the work.

## Product CTAs

Two optional slots, use any combo:
- **`.post-footer .product-cta`** — end-of-post block (default for most posts)
- **`.sb-block.sb-product`** (commented out in template) — sidebar block, uncomment when using

Don't force a product that doesn't match. Link format: `https://sensibleedibles.com/products/{{handle}}` or `/collections/{{handle}}`.

## Updating posts.json (REQUIRED)

After writing the post HTML, prepend this entry to `blog/posts.json` so it appears at the top of the index and in sidebar "Latest posts":

```json
{
  "slug": "{{slug}}",
  "title": "{{title}}",
  "excerpt": "{{excerpt}}",
  "date": "{{YYYY-MM-DD}}",
  "dateDisplay": "{{Month DD, YYYY}}"
}
```

Newest post on top. Keep valid JSON (trailing commas break it).

## Images

- Store in `blog/images/`
- Name with slug prefix: `<slug>.jpg` (hero), `<slug>-02.jpg`, etc.
- Real alt text
- If user hasn't supplied, leave the default `src="images/<slug>.jpg"` — it'll gracefully hide via `onerror` until the file is dropped in

## Commit message

`blog: <slug>` — e.g., `blog: why-xanthan-gum-matters`

If adding multiple posts or structural changes, use a descriptive short message.
