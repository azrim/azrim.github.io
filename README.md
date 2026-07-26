# azrim.my.id

Personal homepage / dev portfolio for **Mirza Moulfi Ghozali** (`@azrim`).

## Stack

- Static only: `index.html`, `styles.css`, `script.js`. No build step.
- Self-hosted variable fonts (Space Grotesk, JetBrains Mono) in `fonts/`.
- Real data: stats and project blurbs come from the GitHub API snapshot at build time.

## Hosting

- Repo: [`azrim/azrim.github.io`](https://github.com/azrim/azrim.github.io)
- GitHub Pages (user site) with custom domain `azrim.my.id` via `CNAME`

## Local preview

```bash
python -m http.server 8080
```

Then open <http://localhost:8080>.

## DNS (Cloudflare)

Keep email MX as-is. For the site:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `185.199.108.153` | DNS only (grey) recommended first |
| A | `@` | `185.199.109.153` | DNS only |
| A | `@` | `185.199.110.153` | DNS only |
| A | `@` | `185.199.111.153` | DNS only |
| CNAME | `www` | `azrim.github.io` | DNS only |

After DNS propagates, enable the custom domain + HTTPS in the repo's Pages settings.
