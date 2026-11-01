# yaseenmlm.github.io

Personal portfolio. Plain HTML/CSS/JS, no build step, served from the repo root.

## Editing content

- All text lives in `content.json` (hero, experience, projects, skills, links).
- Projects take optional fields. Empty ones are hidden automatically:
  - `repo`, `liveDemo`: full URLs
  - `screenshots`: file names (or `{ "file": "a.png", "alt": "description" }`) placed in `assets/projects/<slug>/`
  - `video`: a file name in `assets/projects/<slug>/` (`.mp4`/`.webm`) or a full URL
- Search the repo for `TODO:` to find placeholders.

## Run locally

`content.json` is loaded with `fetch`, so serve the folder rather than opening the file:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Push to GitHub and enable Pages

1. Create an empty repo named exactly `yaseenmlm.github.io` on GitHub (no README, no .gitignore, no license).
2. In this folder:

```bash
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/yaseenmlm/yaseenmlm.github.io.git
git push -u origin main
```

3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`, then Save.
4. After a minute or two the site is live at https://yaseenmlm.github.io.

## Custom domain (yaseenmalam.dev)

Already done in the repo: `CNAME` contains `yaseenmalam.dev`, and `site.baseUrl` plus the canonical/OG tags, `sitemap.xml` and `robots.txt` use it. (To change domains later, edit `site.baseUrl` and `CNAME`, then run `node tools/set-base-url.mjs`.)

1. At your registrar, add DNS records:
   - Apex (`yaseenmalam.dev`): four `A` records pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www`: a `CNAME` record pointing to `yaseenmlm.github.io`
2. Push, then in **Settings → Pages** enter `yaseenmalam.dev` under Custom domain and save.
3. Once the DNS check passes and the certificate is provisioned (can take up to a day), tick **Enforce HTTPS**. `.dev` domains require HTTPS, so browsers won't load it over plain HTTP anyway.

## Notes

- Content is rendered by JavaScript from `content.json`. Search engines that run JS will index it; a `<noscript>` fallback shows the email.
- Never commit `.env` files, keys or real user data.
