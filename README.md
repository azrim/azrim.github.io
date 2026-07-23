# azrim.my.id

Personal homepage / dev portfolio for **Mirza Moulfi Ghozali** (`@azrim`).

## Hosting

- Repo: [`azrim/azrim.github.io`](https://github.com/azrim/azrim.github.io)
- GitHub Pages (user site) → custom domain `azrim.my.id`
- Static only: `index.html`, `styles.css`, `script.js`, `CNAME`

## Local preview

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8080
```

## DNS (Cloudflare)

Keep email MX as-is. For the site:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `185.199.108.153` | DNS only (grey) recommended first |
| A | `@` | `185.199.109.153` | DNS only |
| A | `@` | `185.199.110.153` | DNS only |
| A | `@` | `185.199.111.153` | DNS only |
| CNAME | `www` | `azrim.github.io` | DNS only |

After DNS propagates, GitHub Pages custom domain + HTTPS should go green.
