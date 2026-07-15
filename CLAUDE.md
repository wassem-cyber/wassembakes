# wassembakes

Source for **wassembakes.com** — Wassem Moarsi's personal creator-brand site.

## Hosting & deploys

- Hosted on **Netlify**, **auto-deploys from `main`** (GitHub repo `wassem-cyber/wassembakes-website-front-end`).
- `netlify.toml` configures Netlify to **publish the repo root with no build step** — don't remove it or the deploy fails with "publish directory does not exist."
- ⚠️ **Two publish paths exist.** A separate "Studio" app can publish posts straight to Netlify without touching git. Last deploy wins, so a naive `git push` can overwrite Studio-only content — `_deploy.ps1`'s safety check guards against this (see Workflow).
- No staging branch; test locally before pushing.

## Workflow

- **Pull from prod first.** Before starting any work, run `.\_pull.ps1`. It does `git pull` in `~/wassembakes/` and mirrors deploy → staging. Skipping this risks overwriting changes made from another machine or via the GitHub web UI.
- Edit in `~/wassembakes-staging/`. Test locally with `.\_serve.ps1`.
- **To deploy:** run `.\_deploy.ps1 -Message "what changed"` from staging. It (1) safety-checks that every live post exists in staging — **aborts** if the Studio published something git lacks (so a push can't delete it); (2) mirrors staging → `~/wassembakes/`, excluding `.git`, `.claude`, `_*.ps1`, `CLAUDE.md`; (3) commits + pushes. Netlify deploys in ~30–90s. Bypass the check with `-SkipSafetyCheck` only if the site is unreachable.

## Stack

- **Plain HTML / CSS / JS.** No build step, no bundler, no framework.
- Edit `index.html` directly. Assets (like `hero.jpg`) live at the repo root.
- Don't introduce a build step, a framework, or a static site generator without asking first.

## Related brand

The business brand (Sensible Edible Bakery / Dalissa Baking Co) is a separate entity. See `.claude/skills/sensible-brand/SKILL.md` for brand, voice, and stack guidelines that apply to both.
