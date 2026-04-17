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

Use these facts verbatim when accuracy matters (labels, wholesale decks, compliance-sensitive pages, retailer onboarding). Don't paraphrase regulatory claims.

## Brand colors

| Name          | Pantone     | Hex       | Use                              |
|---------------|-------------|-----------|----------------------------------|
| Orange        | Pantone 1495 C | `#FF8F1C` | Primary accent, CTAs, energy     |
| Blue          | Pantone 550 C  | `#8DB9CA` | Secondary, calm sections, trust  |
| Yellow        | Pantone 122 C  | `#FFD451` | Highlights, warmth, callouts     |
| Cream         | —           | `#E8DCC8` | Backgrounds, warmth, neutral base |

Don't introduce new brand colors without asking. Neutrals (black, white, grays) are fine for type and UI chrome.

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
