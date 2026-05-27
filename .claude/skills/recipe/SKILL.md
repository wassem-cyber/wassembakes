---
name: recipe
description: Write and publish a recipe post for wassembakes.com. Invoke when the user asks to draft, write, or publish a recipe. Produces a static HTML file under /blog/, updates blog/posts.json, follows the site's voice and brand rules, and adds schema.org Recipe structured data for Google rich results.
---

# Recipe Skill

A recipe post is a blog post with a formal recipe block. Most publishing mechanics (posts.json, sidebar widgets, deploy via Netlify auto-deploy from `main`) are inherited from the [[blog-post]] skill — read it for the surrounding architecture. Voice and brand rules come from [[sensible-brand]].

This skill covers what's different for recipes: the recipe-card pattern, the narrative variant, schema.org markup, posts.json fields specific to recipes, and ingredient/measurement conventions.

## Canonical post structure

Every recipe post uses the same shape. The two best references are `whippable-vegan-heavy-cream.html` (most complete — tables with bakers %, variation tables, equipment, instructions, common failures section) and `diy-yogurt-substitute.html` (same pattern, smaller scale).

Structure inside `.post-body`, in order:

1. **Hook** — 1–4 paragraphs that state the problem or insight. No food-blogger preamble.
2. **"The Logic" / "What X Is Really Doing" section** — an `<h2>` that explains the science or principle, followed by an `<h3>` for each main ingredient and a paragraph on *why it's there* (not what it is). This is the educational core.
3. **Optional inline image** between the logic section and the recipe card.
4. **`<div class="recipe-card" id="recipe">`** — the formal recipe block (details below).
5. **Post-recipe sections** — typically "When to Use Which" (if there are variations), "What You Can Do With It" (use cases), and **"Common Failures and Fixes"** (always include if there are any failure modes — this is what makes the post genuinely useful).
6. **Closing line** — one sentence to land it.

Always include a **Skip to recipe** link in the post header.

## Post file template

Use the [[blog-post]] template as the base. Recipe posts add:

- **Skip-to-recipe link** in `.post-header`
- **`.recipe-card` block** in `.post-body`
- **Schema.org Recipe JSON-LD** in `<head>`
- **`recipeTags` array** in posts.json entry

### Skip-to-recipe link

Inside `.post-header`, after `<div class="post-tags" data-post-tags></div>`:

```html
<a class="skip-to-recipe" href="#recipe">Skip to recipe &darr;</a>
```

### Recipe card block

Place inside `.post-body`, after the intro and logic sections. Order inside the card: title → meta → hero → Equipment → Ingredients (table) → Variation(s) (if any) → Instructions.

```html
<div class="recipe-card" id="recipe">
  <h2 class="recipe-card-title">{{recipe title}}</h2>
  <div class="recipe-card-meta">
    <div class="recipe-meta-item">
      <h4 class="recipe-meta-label">Yield</h4>
      <p class="recipe-meta-value">{{N g / N servings}}</p>
    </div>
    <div class="recipe-meta-item">
      <h4 class="recipe-meta-label">Prep time</h4>
      <p class="recipe-meta-value">{{N min}}</p>
    </div>
    <div class="recipe-meta-item">
      <h4 class="recipe-meta-label">Bake time</h4>
      <p class="recipe-meta-value">{{N min}}</p>
    </div>
    <!-- Pick 2–4 that apply: Yield, Prep time, Bake time, Cook time, Chill time, Rest time, Total time. -->
  </div>
  <img class="recipe-card-hero" src="images/{{slug}}-flatlay-800w.jpg" alt="{{alt}}" loading="lazy" decoding="async"
    srcset="images/{{slug}}-flatlay-480w.jpg 480w, images/{{slug}}-flatlay-800w.jpg 800w, images/{{slug}}-flatlay-1200w.jpg 1200w"
    sizes="(max-width: 600px) 100vw, (max-width: 1024px) 800px, 1200px">

  <h3>Equipment</h3>
  <ul>
    <li>{{tool}}</li>
  </ul>

  <h3>Ingredients</h3>
  <table>
    <thead>
      <tr><th>Ingredient</th><th>Weight</th><th>%</th></tr>
    </thead>
    <tbody>
      <tr><td>{{Ingredient}}</td><td>{{Ng}}</td><td>{{N.NN%}}</td></tr>
      <tr><td><strong>Total</strong></td><td><strong>{{Ng}}</strong></td><td><strong>100%</strong></td></tr>
    </tbody>
  </table>

  <!-- Variation table (optional) -->
  <h3>{{Variation name}} (Optional/Advanced)</h3>
  <p>{{One paragraph: when and why to use this variation.}}</p>
  <table>
    <!-- same structure as Ingredients -->
  </table>
  <blockquote><strong>Warning:</strong> {{any safety note, e.g. raw starter, hot sugar}}</blockquote>

  <h3>Instructions</h3>
  <ol>
    <li>{{step}}</li>
  </ol>
</div>
```

Notes:
- Use `id="recipe"` exactly — the skip link depends on it.
- **Ingredients as a `<table>` with Weight + % columns is the standard.** Bakers percentages let readers scale up or down. Compute % as `ingredient_g / total_g * 100`, two decimals. End with a bold Total row.
- Meta items: pick 2–4. Section headings (`<h3>`) inside the card have **no trailing colon** ("Ingredients", not "Ingredients:").
- Equipment list is optional — drop it for trivial mixes (whisk + bowl).
- Variations get their own `<h3>` + table inside the card (e.g. "Aquafaba Version" in the heavy cream post, "Sourdough Version" in the yogurt substitute post).
- For variations with separate instructions, use an `<h4>` "{{Variation}} Instructions" + its own `<ol>` after the main Instructions list.

### Schema.org Recipe JSON-LD

Add inside `<head>`, after the `<link rel="stylesheet" href="blog.css">` line. Fills in fields from the recipe card.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Recipe",
  "name": "{{recipe title}}",
  "image": "https://wassembakes.com/blog/images/{{slug}}-flatlay-1200w.jpg",
  "author": { "@type": "Person", "name": "Wassem Moarsi" },
  "datePublished": "{{YYYY-MM-DD}}",
  "description": "{{excerpt}}",
  "prepTime": "PT{{N}}M",
  "cookTime": "PT{{N}}M",
  "totalTime": "PT{{N}}M",
  "recipeYield": "{{N servings/muffins/loaves}}",
  "recipeCategory": "{{Breakfast|Dessert|Bread|...}}",
  "recipeCuisine": "{{optional}}",
  "suitableForDiet": ["https://schema.org/VeganDiet", "https://schema.org/GlutenFreeDiet"],
  "recipeIngredient": [
    "240g Butter",
    "288g Whole milk"
  ],
  "recipeInstructions": [
    { "@type": "HowToStep", "text": "Preheat oven to 350F." },
    { "@type": "HowToStep", "text": "Mix dry ingredients." }
  ]
}
</script>
```

- Use ISO 8601 durations: `PT15M` (15 min), `PT1H30M` (1h30m).
- `suitableForDiet` accepts any of: `VeganDiet`, `VegetarianDiet`, `GlutenFreeDiet`, `LowSaltDiet`, `LowLactoseDiet`, `DiabeticDiet`, `LowFatDiet`, `LowCalorieDiet`. Match what the recipe actually is.
- Drop fields that don't apply (no `cookTime` if it's a no-cook recipe). Don't make up values.
- Validate at [Schema.org Validator](https://validator.schema.org/) when in doubt.

## Required posts.json fields for recipes

Standard blog-post fields plus:

```json
{
  "slug": "{{slug}}",
  "title": "{{title}}",
  "shortTitle": "{{short title for links page, optional}}",
  "excerpt": "{{excerpt}}",
  "date": "{{YYYY-MM-DD}}",
  "dateDisplay": "{{Month DD, YYYY}}",
  "image": "{{slug}}-hero.jpg",
  "tags": ["Recipes", "{{Vegan|Gluten-Free|etc.}}"],
  "recipeTags": ["{{Vegan|Gluten-Free|etc.}}"]
}
```

- `tags` — always start with `"Recipes"` for recipe posts; add dietary tags after
- `recipeTags` — dietary attributes only (subset of `tags` minus `"Recipes"`). Drives the recipe filter UI on `/blog/recipes.html`
- `shortTitle` — optional. If the full title is too long for the links page (`/links/`), set a 2–4 word version that still reads as the recipe (e.g. `"DIY Yogurt Substitute"` instead of `"DIY Yogurt Substitute for Baking (When You're in a Pinch)"`). Falls back to `title` if not set

## Ingredient & measurement conventions

- **Weight-first.** Grams are the default for flour, sugar, fats, liquids, starches. American volume (tsp/tbsp/cup) is fine for tiny quantities (spices, leaveners) or where the bakery uses it.
- **Format:** `{{amount}}{{unit}} {{Ingredient}}` — e.g. `240g Butter`, `1 1/2 tsp Vanilla extract`, `6 Eggs`.
- **Ingredient name capitalized.** Matches existing posts.
- **Notes in parentheses** for substitutions or grade: `295g Almond flour (blanched, fine)`.
- **Temperatures:** Fahrenheit primary — `350F` or `350°F`. Add Celsius in parens for breads/precise bakes if useful.
- **No oven-temp ambiguity** — say "preheat" and the actual temp in step 1.

## Voice for recipes

Voice rules from [[sensible-brand]] apply. Recipe-specific notes:

- **Skip the food-blogger preamble.** No childhood memory, no "the BEST" superlatives, no "you're going to LOVE this." Open with the technique, the trick, or the reason this recipe exists at the bakery.
- **Say what each ingredient does** when it matters. "Psyllium builds the structure. Coconut milk delivers the fat." Don't lecture on every ingredient — only the ones doing real work.
- **Steps are imperative and tight.** "Whisk together dry ingredients" — not "now you're going to want to take your whisk and combine your dry ingredients in a bowl."
- **State storage and shelf life** when relevant. "Keeps in the fridge for 4–5 days." One line, end of recipe section.
- **Warn explicitly when needed** — raw starter, raw egg, hot sugar, allergen cross-contact. Short and direct, not panicked.

Good: "Whisk everything until smooth. Keeps 4–5 days in the fridge."
Bad: "Combine all of your beautiful ingredients in a bowl and watch the magic happen!"

## Hero image conventions

Recipe posts often use two hero images:

1. **Post hero** (`<img class="post-hero">`) — usually an action/stack/styled shot. `{{slug}}-stack.jpg` or `{{slug}}-hero.jpg`.
2. **Recipe-card hero** (`<img class="recipe-card-hero">`) — top-down flatlay of the finished thing. `{{slug}}-flatlay.jpg`.

Both should be served via `srcset` at 480w/800w/1200w. Drop a 1600px master into `blog/images/` and resize. If only one image is available, reuse it for both — they don't have to be different.

## Product CTA

Most recipe posts link to a related Sensible Edibles product (the muffin posts all link to the matching bakery product). Use the `.post-footer .product-cta` block with an image. If no matching product exists, skip the CTA entirely — don't force-fit.

## Worked examples

- **`blog/whippable-vegan-heavy-cream.html`** — the most complete reference. Hook + logic with per-ingredient `<h3>` rationale, recipe card with main ingredient table + aquafaba variation table + numbered instructions, post-recipe "What You Can Do With It" and "Common Failures and Fixes" sections.
- **`blog/diy-yogurt-substitute.html`** — same pattern at smaller scale, with an "Advanced" sourdough variation and separate variation-instructions block.
- **`blog/lemon-zucchini-protein-muffins.html`** — older post; uses `<ul>` for ingredients instead of a table. Acceptable but tables-with-% is preferred going forward.

## Commit message

`recipe: <slug>` — e.g., `recipe: diy-yogurt-substitute`.
