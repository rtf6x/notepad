# Notepad

Personal notes app — [notepad.rootfox.cc](https://notepad.rootfox.cc).

**Stack:** Go, MongoDB, [templ](https://templ.guide/), vanilla JS (notes editor).

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

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8901` | HTTP port |
| `MONGO_URI` | — | Full URI (overrides host/user below) |
| `MONGO_HOST` | `127.0.0.1` | Mongo host |
| `MONGO_PORT` | `27017` | Mongo port |
| `MONGO_DB` | `notepad` | Database name |
| `MONGO_USER` | — | Mongo user |
| `MONGO_PASSWORD` | — | Mongo password |
| `PUBLIC_DIR` | `public` | Static assets |

Example:

```bash
export MONGO_HOST=127.0.0.1
export MONGO_PORT=27017
export MONGO_DB=notepad
export MONGO_USER=notepad
export MONGO_PASSWORD=secret
export PORT=8901
```

Or single URI:

```bash
export MONGO_URI="mongodb://notepad:secret@127.0.0.1:27017/notepad"
```

## Run locally

```bash
go generate ./templates
go build -o notepad ./cmd/notepad
./notepad
```

Open `http://localhost:8901`.

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
go build -ldflags="-s -w" -o notepad ./cmd/notepad

pm2 stop --silent notepad || :
pm2 delete --silent notepad || :
truncate -s 0 ~/.pm2/logs/notepad-out.log
truncate -s 0 ~/.pm2/logs/notepad-error.log

export PORT=8901
export MONGO_HOST=127.0.0.1
export MONGO_PORT=27017
export MONGO_DB=notepad
export MONGO_USER=notepad
# MONGO_PASSWORD — set in Jenkins job / global environment (Secret text), do not commit

pm2 start ./notepad --name notepad --update-env
```

Or single URI instead of host/user/password:

```bash
export MONGO_URI="mongodb://notepad:${MONGO_PASSWORD}@127.0.0.1:27017/notepad"
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
internal/handler/     HTTP routes + templ render
internal/middleware/  session cookie
templates/            HTML (templ)
public/               css, js, fonts, images
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
| GET | `/notes` | Redirect to first note |
| GET | `/notes/{id}` | Notes UI |
| POST | `/notes/new` | Create note |
| POST | `/notes/{id}/save` | Save title + body |
| POST | `/notes/{id}/delete` | Delete note |
