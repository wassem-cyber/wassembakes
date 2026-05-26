---
name: recipe
description: Write and publish a recipe post for wassembakes.com. Invoke when the user asks to draft, write, or publish a recipe. Produces a static HTML file under /blog/, updates blog/posts.json, follows the site's voice and brand rules, and adds schema.org Recipe structured data for Google rich results.
---

# Recipe Skill

A recipe post is a blog post with a formal recipe block. Most publishing mechanics (posts.json, sidebar widgets, deploy via Netlify auto-deploy from `main`) are inherited from the [[blog-post]] skill — read it for the surrounding architecture. Voice and brand rules come from [[sensible-brand]].

This skill covers what's different for recipes: the recipe-card pattern, the narrative variant, schema.org markup, posts.json fields specific to recipes, and ingredient/measurement conventions.

## Two recipe patterns

Pick one based on the shape of the recipe.

### Pattern A — Recipe card (default)

One main recipe, formal structure. Used by `lemon-zucchini-protein-muffins.html`, `pumpkin-pie-muffin.html`, etc.

Structure inside `.post-body`:

1. Story intro (1–4 paragraphs) — context, why this recipe exists, what makes it work
2. Optional in-line images
3. **`<div class="recipe-card" id="recipe">`** — the formal recipe block
4. Optional closing notes after the card

Always include a **Skip to recipe** link in the post header so readers can jump to the card.

### Pattern B — Narrative recipe

Multiple ingredient lists, variations, or an essay-led recipe. Used when the recipe is more about the *technique* than reproducing one dish exactly (e.g. "DIY Yogurt Substitute" with vinegar + sourdough variations).

No `recipe-card` div, no skip-to-recipe link. Ingredients appear as plain `<ul>` lists inside the prose, under `<h2>`/`<h3>` section headings. Each variation gets its own list.

Schema.org markup is optional for this pattern (multiple recipes in one post don't map cleanly to a single Recipe object — pick the primary variation if you include it, or skip).

## Post file template

Use the [[blog-post]] template as the base. Recipe posts add:

- **Skip-to-recipe link** in `.post-header` (Pattern A only)
- **`.recipe-card` block** in `.post-body` (Pattern A only)
- **Schema.org Recipe JSON-LD** in `<head>` (Pattern A default; Pattern B optional)
- **`recipeTags` array** in posts.json entry (both patterns)

### Skip-to-recipe link (Pattern A)

Inside `.post-header`, after `<div class="post-tags" data-post-tags></div>`:

```html
<a class="skip-to-recipe" href="#recipe">Skip to recipe &darr;</a>
```

### Recipe card block (Pattern A)

Place inside `.post-body`, after the intro paragraphs and any in-line images:

```html
<div class="recipe-card" id="recipe">
  <h2 class="recipe-card-title">{{recipe title}}</h2>
  <div class="recipe-card-meta">
    <div class="recipe-meta-item">
      <h4 class="recipe-meta-label">Prep time</h4>
      <p class="recipe-meta-value">{{N min}}</p>
    </div>
    <div class="recipe-meta-item">
      <h4 class="recipe-meta-label">Bake time</h4>
      <p class="recipe-meta-value">{{N min}}</p>
    </div>
    <!-- Optional additional meta items: Yield, Total time, Chill time, etc. -->
  </div>
  <img class="recipe-card-hero" src="images/{{slug}}-flatlay-800w.jpg" alt="{{alt}}" loading="lazy" decoding="async"
    srcset="images/{{slug}}-flatlay-480w.jpg 480w, images/{{slug}}-flatlay-800w.jpg 800w, images/{{slug}}-flatlay-1200w.jpg 1200w"
    sizes="(max-width: 600px) 100vw, (max-width: 1024px) 800px, 1200px">

  <h3>Ingredients:</h3>
  <ul>
    <li>{{amount}} {{ingredient}}</li>
    <!-- ... -->
  </ul>

  <h3>Equipment:</h3>
  <ul>
    <li>{{tool}}</li>
    <!-- ... -->
  </ul>

  <h3>Steps:</h3>
  <ol>
    <li>{{step instruction}}</li>
    <!-- ... -->
  </ol>
</div>
```

Notes:
- Use `id="recipe"` exactly — the skip link depends on it.
- Meta items are flexible: include whichever apply (Prep, Bake, Cook, Chill, Rest, Yield, Total). 2–4 items reads cleanest.
- Equipment list is optional — drop it for trivial mixes (whisk + bowl).

### Schema.org Recipe JSON-LD (Pattern A default)

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

## Worked example

The DIY Yogurt Substitute post is the canonical Pattern B (narrative) example — see `blog/diy-yogurt-substitute.html` once published. Lemon Zucchini Protein Muffins is the canonical Pattern A (recipe card) example — see `blog/lemon-zucchini-protein-muffins.html`.

## Commit message

`recipe: <slug>` — e.g., `recipe: diy-yogurt-substitute`.
