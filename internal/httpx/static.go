package httpx

import (
	"net/http"
	"strings"
)

// CachedFileServer serves files from dir with long-lived cache headers for static assets.
func CachedFileServer(dir string) http.Handler {
	fs := http.FileServer(http.Dir(dir))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		path := r.URL.Path
		switch {
		case strings.HasPrefix(path, "/fonts/"),
			strings.HasPrefix(path, "/images/"),
			path == "/favicon.png",
			path == "/og.png":
			w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		case strings.HasPrefix(path, "/css/"),
			strings.HasPrefix(path, "/js/"),
			strings.HasPrefix(path, "/app/"):
			w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		}
		fs.ServeHTTP(w, r)
	})
}
