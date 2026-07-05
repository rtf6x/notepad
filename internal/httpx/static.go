package httpx

import (
	"net/http"
	"strings"
)

// CachedFileServer serves files from dir with long-lived cache headers for static assets.
func CachedFileServer(dir string) http.Handler {
	fs := http.FileServer(http.Dir(dir))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case strings.HasPrefix(r.URL.Path, "/fonts/"),
			strings.HasPrefix(r.URL.Path, "/images/"),
			r.URL.Path == "/favicon.png":
			w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		case strings.HasPrefix(r.URL.Path, "/css/"),
			strings.HasPrefix(r.URL.Path, "/js/"):
			w.Header().Set("Cache-Control", "public, max-age=86400")
		}
		fs.ServeHTTP(w, r)
	})
}
