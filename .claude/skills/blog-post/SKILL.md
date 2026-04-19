---
name: blog-post
description: Write and publish a new blog post for wassembakes.com. Invoke when the user asks to draft, write, or publish a blog post. Produces a static HTML file under /blog/, adds it to the index, and follows the site's voice and brand rules.
---

# Blog Post Skill

Use this when writing a new post for wassembakes.com. Voice and brand rules come from the `sensible-brand` skill — read that first if it hasn't been loaded this session.

## Output

Every post is a standalone HTML file at `blog/<slug>.html`. No build step, no templating engine — the file is pushed as-is to GitHub and served by Netlify.

## Post file template

Copy this structure exactly. Replace the `{{placeholders}}` — keep every attribute, class, and wrapper.

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
<meta property="og:image" content="https://wassembakes.com/blog/images/{{hero-image-filename}}">
<meta property="og:url" content="https://wassembakes.com/blog/{{slug}}.html">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://wassembakes.com/blog/images/{{hero-image-filename}}">
<meta name="article:published_time" content="{{YYYY-MM-DD}}">
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

<article class="post">
  <div class="post-meta">{{Month DD, YYYY}} &middot; {{N}} min read</div>
  <h1>{{title}}</h1>
  <p class="excerpt">{{excerpt}}</p>

  <img class="post-hero" src="images/{{hero-image-filename}}" alt="{{alt text}}" fetchpriority="high" decoding="async">

  <div class="post-body">
    {{body paragraphs and headings}}
  </div>

  <div class="post-footer">
    <div class="product-cta">
      <div class="label">Shop the recipe</div>
      <h3>{{Product name}}</h3>
      <p>{{one-line description of why it fits this post}}</p>
      <a class="btn" href="https://sensibleedibles.com/products/{{product-handle}}">Buy from Sensible &rarr;</a>
    </div>
    <div class="subscribe-cta">
      <p>Get posts like this in your inbox.</p>
      <a href="https://wassembakes.beehiiv.com/subscribe">Subscribe to the newsletter</a>
    </div>
  </div>
</article>

<footer class="site-footer">
  <div class="footer-wrap">
    <div>&copy; 2026 Wassem Moarsi &middot; All rights reserved</div>
    <div><a href="https://sensiblebakery.com">Sensible Edible Bakery &rarr;</a></div>
  </div>
</footer>

</body>
</html>
```

## Required fields per post

- **slug** — kebab-case, under 60 chars, no dates (e.g. `why-xanthan-gum-matters`)
- **title** — sentence case, under 70 chars, no clickbait
- **excerpt** — 1–2 sentence hook, under 160 chars, works as meta description AND social preview
- **date** — ISO (`2026-04-19`) in the meta tag, human-readable ("April 19, 2026") in the post-meta line
- **read time** — rough word count / 225, rounded up (e.g., 900 words = 4 min)
- **hero image** — saved at `blog/images/<slug>.jpg`, 1600px wide or larger, compressed (~200–400 KB)
- **alt text** — describe the image concretely; don't start with "image of"

## Body structure

Use semantic HTML inside `.post-body`:
- `<p>` for paragraphs
- `<h2>` for section breaks (Fraunces serif, auto-styled)
- `<h3>` for subsections
- `<ul>` / `<ol>` for lists
- `<blockquote>` for pulled quotes
- `<table>` for ratio charts
- `<code>` for ingredient weights or temps when inline
- `<img src="images/..." alt="...">` for inline images (auto-styled)
- Links: full URLs, always open-to-same-tab unless external commerce (then `target="_blank" rel="noopener"`)

## Voice rules (from sensible-brand)

- Casual, direct, authoritative — 20+ years of baking experience, write from that seat
- No marketing speak: artisanal, curated, journey, passionate, handcrafted, elevate, unlock, empower
- If it sounds like a LinkedIn post, rewrite it
- Use specific numbers, real ratios, actual temperatures. Show the work.

## Product CTAs

Every post should funnel to Sensible. Rules:
- One primary product CTA in the `.product-cta` block at the bottom
- Optional: inline mentions within the body if they fit naturally (e.g., "I use our [chocolate chip cookie mix](https://sensibleedibles.com/products/...) for this")
- Never force-fit a product that doesn't match the post
- Link structure: `https://sensibleedibles.com/products/{{product-handle}}`

## Updating the blog index

After writing the post, open `blog/index.html` and insert this card right after `<!-- POSTS_START -->`:

```html
  <li class="post-card">
    <a href="{{slug}}.html">
      <div class="post-card-date">{{Month DD, YYYY}}</div>
      <div>
        <h2>{{title}}</h2>
        <p class="post-card-excerpt">{{excerpt}}</p>
      </div>
    </a>
  </li>
```

If `<li class="posts-empty">First post coming soon.</li>` is still there, remove that line.

Newest post goes on top.

## Images

- Store all post images in `blog/images/`
- Name them with the post slug as prefix: `why-xanthan-gum-matters.jpg`, `why-xanthan-gum-matters-02.jpg`, etc.
- Always provide real alt text
- If the user hasn't given you images, leave `src="images/{{slug}}.jpg"` as a placeholder and tell them what to drop in

## Commit message format

When committing, use: `blog: <slug>` — e.g., `blog: why-xanthan-gum-matters`.
