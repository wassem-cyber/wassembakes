---
name: sensible-brand
description: Brand, voice, and tech-stack guidelines for Wassem Moarsi's brands — Sensible Edible Bakery (business) and wassembakes (personal creator brand). Invoke when writing copy, designing UI, choosing colors, or making implementation choices for either brand's site, product, or marketing content.
---

# Sensible Brand Skill

Guidelines for Wassem Moarsi's two brands. Apply these whenever producing copy, visual design, or technical recommendations for either brand.

## The two brands

**Sensible Edible Bakery** — the business.
**wassembakes** — Wassem's personal creator brand (social, content, teaching).

Keep them distinct but visually and tonally adjacent. The business carries the legal and compliance weight; the creator brand carries personality and reach.

## Business details (Sensible Edible Bakery)

- Legal/operating entity: **Dalissa Baking Co**
- Address: **30-30 47th Ave, Long Island City, NY**
- **FDA registered**
- **FSMA compliant** (Food Safety Modernization Act)
- **100% gluten-free, peanut-free, wheat-free, sesame-free kitchen** — no shared equipment, no cross-contact risk
- **Wassem Moarsi, CEO** — founder and head baker

Use these facts verbatim when accuracy matters (labels, wholesale decks, compliance-sensitive pages, retailer onboarding). Don't paraphrase regulatory or allergen claims.

## Wassem's background

Use this to anchor the "authoritative, real-science" voice — reference when a post benefits from credibility context, but don't shoehorn it in.

- **BS in Biology** and **MS in Biology**
- **20+ years** of professional baking
- Owner and operator of Sensible Edible Bakery — the largest gluten-free and vegan bakery in NYC
- Grounds the creator brand's pitch: when Wassem talks ratios, extraction, gluten development, fermentation, the blood-sugar impact of ingredient choices — it's informed by actual biochemistry, not internet folklore

Good use: "I studied biology — here's what's actually happening to the starches when you let the dough rest."
Bad use: "Wassem Moarsi, a trained biologist, brings scientific expertise to baking." (that's marketing-speak)

## Bakery mission & values

Use as source material when writing About-page content, brand decks, or wholesale pitches. Paraphrase lightly — these are first-person values, not boilerplate.

- **Mission statement (use verbatim when needed):** "Food should nourish the body, respect animals, and protect the planet."
- **Product philosophy:** real, nutrient-dense ingredients. Pair protein + fiber in nearly every product to blunt glucose spikes. Moderate sugar. Healthy organic fats. Antioxidants where they fit naturally.
- **Sustainability:** composts on-site; avoids harsh chemicals and unnecessary preservatives; a portion of proceeds supports animal rescue, hunger relief, and environmental restoration.
- **Education posture:** mentors interns, shares baking science openly (blog, social, in-kitchen). Not gatekeeping.

When pitching Sensible on the creator brand (wassembakes), these values justify the shop link — it's not just commerce, it's the same philosophy Wassem talks about in his content.

## Brand colors

| Name          | Pantone     | Hex       | Use                              |
|---------------|-------------|-----------|----------------------------------|
| Orange        | Pantone 1495 C | `#FF8F1C` | Primary accent, CTAs, energy     |
| Blue          | Pantone 550 C  | `#8DB9CA` | Secondary, calm sections, trust  |
| Yellow        | Pantone 122 C  | `#FFD451` | Highlights, warmth, callouts     |
| Cream         | —           | `#E8DCC8` | Backgrounds, warmth, neutral base |

Don't introduce new brand colors without asking. Neutrals (black, white, grays) are fine for type and UI chrome.

## Logo / wordmark (wassembakes)

The wassembakes wordmark is set in **Fraunces 900 italic** with the `a` in "bakes" and the trailing period in **brand orange (#FF8F1C)**. Type and accents on a yellow (`#FFD451`) field is the canonical brand-mark presentation.

Master files live in `assets/`:

| File                       | Use                                                                 |
|----------------------------|---------------------------------------------------------------------|
| `logo.svg`                 | Stacked wordmark, transparent bg — primary master                   |
| `logo-horizontal.svg`      | Single-line "wassem bakes." — headers, email signatures, wide spaces |
| `logo-square.svg`          | 1:1 with yellow background — IG avatar, app icons, social profiles  |
| `logo-dark.svg`            | Cream/paper type for dark backgrounds — orange accent stays orange  |
| `logo-mark.svg`            | "w." mark only — favicons, tiny placements (≤32px), watermarks      |

Rules:

- **Don't recolor** the type without the orange accent — the colored `a` and period are the recognition cues.
- **Don't compress vertically** or add a stroke. Use the SVG masters; don't recreate in raster unless exporting from these.
- For an OG / Twitter image, export `logo-square.svg` to a 1200×630 PNG with the wordmark left-aligned over yellow. (Raster export not committed yet — use a converter or design tool when needed.)
- In-page text logos (the nav element) use the same accent pattern in HTML: `wassem b<span class="logo-accent">a</span>kes<span class="logo-accent">.</span>` with `.logo-accent { color: var(--orange); }`.

## Voice

- **Casual** — write like a human, not a brochure.
- **Direct** — say the thing. No throat-clearing, no "we are excited to announce."
- **Authoritative** — Wassem has **20+ years** of baking experience. Write from that seat.
- **No corporate marketing speak** — avoid "artisanal," "curated," "journey," "passionate about," "handcrafted with love," "elevate," "unlock," "empower."

Good: "These are the cookies we actually bake every day. Here's what's in them."
Bad: "We're passionate about curating an elevated, handcrafted cookie experience."

When in doubt, read it out loud. If it sounds like a LinkedIn post, rewrite it.

## Tech stack preferences

- **Hosting:** Netlify
- **Source control / deploys:** GitHub (auto-deploy from `main`)
- **Frontend:** plain HTML/CSS/JS. **No build step** unless there's a real reason.
- **No WordPress.** Don't suggest it, don't migrate to it.
- **Payments:** Stripe
- **Product data:** Shopify API (product catalog only — not the storefront)
- **Orders / accounting:** QuickBooks

When making technical recommendations, stay inside this stack. If something requires stepping outside it (e.g., a framework, a CMS, a different payment processor), flag the tradeoff and ask before proposing it as the default.

## Quick checklist before shipping copy or code

- [ ] Tone matches voice guide (casual, direct, authoritative, no marketing speak)
- [ ] Colors are from the palette above
- [ ] Regulatory/compliance claims are stated verbatim, not paraphrased
- [ ] Tech choices fit the stack (Netlify, GitHub, plain HTML, Stripe, Shopify API, QuickBooks)
- [ ] Brand is used correctly: business = Sensible Edible Bakery, creator = wassembakes
