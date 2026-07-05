# Notepad

Personal notes app — [notepad.rootfox.cc](https://notepad.rootfox.cc).

**Stack:** Go, MongoDB, [templ](https://templ.guide/) (auth), [Svelte](https://svelte.dev/) (notes SPA).

Generated at build time (not in git): `templates/*_templ.go`, `public/app/*`, `public/css/app.css`.

## Build

```bash
./scripts/build.sh -mongo-host 127.0.0.1 -mongo-user notepad -mongo-password "$MONGO_PASSWORD"
```

Runs DB migrations first, then templ, Svelte, SCSS, and `go build`. Pass the same Mongo flags as for `./notepad`.

Manual steps (without migrations):

```bash
go generate ./templates
(cd web && npm ci && npm run build)
cat styles/*.scss | npx sass --stdin public/css/app.css --load-path=styles
go build -o notepad ./cmd/notepad
```

## Run

```bash
./notepad -mongo-host 127.0.0.1 -mongo-user notepad -mongo-password "$MONGO_PASSWORD"
```

Open `http://localhost:8901`.

Svelte HMR (optional): run `./notepad` in one terminal, `cd web && npm run dev` in another.

## MongoDB

```javascript
use notepad
db.createUser({
  user: "notepad",
  pwd: "YOUR_PASSWORD",
  roles: [{ role: "readWrite", db: "notepad" }]
})
```

Collections: `users`, `tokens`, `notes`, `migrations`.

## Config

Flags override env vars.

| Flag | Env | Default |
|---|---|---|
| `-port` | `PORT` | `8901` |
| `-mongo-uri` | `MONGO_URI` | — |
| `-mongo-host` | `MONGO_HOST` | `127.0.0.1` |
| `-mongo-port` | `MONGO_PORT` | `27017` |
| `-mongo-db` | `MONGO_DB` | `notepad` |
| `-mongo-user` | `MONGO_USER` | — |
| `-mongo-password` | `MONGO_PASSWORD` | — |
| `-public-dir` | `PUBLIC_DIR` | `public` |

## Layout

```
cmd/notepad/       entrypoint
cmd/migrate/       DB migrations (run via scripts/build.sh)
internal/          store, handlers, middleware, migrate
templates/         auth pages (templ sources)
web/               Svelte notes UI
public/            static assets + built frontend
styles/            SCSS sources
```

## API

| Method | Path |
|---|---|
| GET | `/notes`, `/notes/{id}` — Svelte shell |
| GET/POST | `/login`, `/register`, `/forgot`, `/logout` |
| GET | `/api/notes` |
| POST | `/api/notes` |
| GET | `/api/notes/{id}` |
| PUT | `/api/notes/{id}` |
| DELETE | `/api/notes/{id}` |
