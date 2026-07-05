# Notepad

Personal notes app — [notepad.rootfox.cc](https://notepad.rootfox.cc).

**Stack:** Go, MongoDB, [templ](https://templ.guide/) (auth), [Svelte](https://svelte.dev/) (notes SPA).

Generated at build time (not in git): `templates/*_templ.go`, `public/app/*` (Svelte), `public/css/app.css` (SCSS).

## Run locally

```bash
go generate ./templates
(cd web && npm ci && npm run build)
cat styles/*.scss | npx sass --stdin public/css/app.css --load-path=styles
go build -o notepad ./cmd/notepad
./notepad
```

Open `http://localhost:8901`.

Svelte dev server with API proxy (optional):

```bash
# terminal 1
go generate ./templates
go build -o notepad ./cmd/notepad
./notepad

# terminal 2
cd web && npm run dev
```

## MongoDB setup

```javascript
// mongosh
use notepad
db.createUser({
  user: "notepad",
  pwd: "YOUR_PASSWORD",
  roles: [{ role: "readWrite", db: "notepad" }]
})
```

Collections (created on first use): `users`, `tokens`, `notes` — same shape as the legacy app.

## Environment

Flags override env vars. Env vars are convenient for local dev; production deploy passes flags after `--` in the `pm2 start` command.

| Flag | Env | Default | Description |
|---|---|---|---|
| `-port` | `PORT` | `8901` | HTTP port |
| `-mongo-uri` | `MONGO_URI` | — | Full URI (overrides host/user below) |
| `-mongo-host` | `MONGO_HOST` | `127.0.0.1` | Mongo host |
| `-mongo-port` | `MONGO_PORT` | `27017` | Mongo port |
| `-mongo-db` | `MONGO_DB` | `notepad` | Database name |
| `-mongo-user` | `MONGO_USER` | — | Mongo user |
| `-mongo-password` | `MONGO_PASSWORD` | — | Mongo password |
| `-public-dir` | `PUBLIC_DIR` | `public` | Static assets |

Example (local):

```bash
./notepad -mongo-host rootfox.cc -mongo-port 28888 -mongo-user notepad -mongo-password "$MONGO_PASSWORD"
```

## CSS

Recompile after editing `styles/*.scss`:

```bash
cat styles/*.scss | npx sass --stdin public/css/app.css --load-path=styles
```

## Deploy (Jenkins + PM2)

Jenkins execute shell (first line `#!/bin/bash` is required):

```bash
#!/bin/bash
set -euo pipefail
export PATH=/usr/local/go/bin:$PATH

go generate ./templates
(cd web && npm ci && npm run build)
cat styles/*.scss | npx sass --stdin public/css/app.css --load-path=styles
go build -ldflags="-s -w" -o notepad ./cmd/notepad

pm2 stop --silent notepad || :
pm2 delete --silent notepad || :
truncate -s 0 ~/.pm2/logs/notepad-out.log
truncate -s 0 ~/.pm2/logs/notepad-error.log

# MONGO_PASSWORD — Jenkins Secret text binding (Variable: MONGO_PASSWORD)
pm2 start ./notepad --name notepad -- \
  -port 8901 \
  -mongo-host 127.0.0.1 \
  -mongo-port 28888 \
  -mongo-user notepad \
  -mongo-password "$MONGO_PASSWORD"
```

Or single URI:

```bash
pm2 start ./notepad --name notepad -- \
  -mongo-uri "mongodb://notepad:${MONGO_PASSWORD}@127.0.0.1:28888/notepad"
```

## nginx

Example config: `deploy/nginx/notepad.rootfox.cc.conf`

```bash
sudo cp deploy/nginx/notepad.rootfox.cc.conf /etc/nginx/sites-available/notepad.rootfox.cc
sudo ln -sf /etc/nginx/sites-available/notepad.rootfox.cc /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

TLS (first time):

```bash
sudo certbot --nginx -d notepad.rootfox.cc
```

App listens on **127.0.0.1:8901**; nginx proxies HTTPS to it. No WebSocket locations needed.

## Project layout

```
cmd/notepad/          entrypoint
internal/store/       MongoDB access
internal/handler/     HTTP routes, JSON API, templ auth
internal/middleware/  session cookie
templates/            auth HTML (templ)
web/                  Svelte notes app (Vite)
public/               css, fonts, images, compiled app/
styles/               SCSS sources
```

## Auth

- Session cookie `notepad_session` (httpOnly)
- New passwords: **bcrypt**
- Legacy **MD5** hashes from old Mongo data still work on login

## Routes

| Method | Path | Description |
|---|---|---|
| GET | `/`, `/login` | Login form |
| POST | `/login` | Sign in |
| GET/POST | `/register` | Register |
| GET/POST | `/forgot` | Forgot password (stub) |
| POST | `/logout` | Sign out |
| GET | `/notes`, `/notes/{id}` | Notes shell (Svelte) |
| GET | `/api/notes` | List notes (JSON) |
| POST | `/api/notes` | Create note |
| GET | `/api/notes/{id}` | Get note |
| PUT | `/api/notes/{id}` | Update note |
| DELETE | `/api/notes/{id}` | Delete note |
