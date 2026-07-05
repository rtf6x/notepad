package middleware

import (
	"context"
	"net/http"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/rtf6x/notepad/internal/store"
)

type contextKey string

const sessionKey contextKey = "session"

const CookieName = "notepad_session"

func WithSession(st *store.Store) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			c, err := r.Cookie(CookieName)
			if err != nil || c.Value == "" {
				next.ServeHTTP(w, r)
				return
			}
			id, err := primitive.ObjectIDFromHex(c.Value)
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}
			sess, err := st.FindSession(r.Context(), id)
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}
			ctx := context.WithValue(r.Context(), sessionKey, sess)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func RequireSession(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if SessionFrom(r.Context()) == nil {
			http.Redirect(w, r, "/login", http.StatusFound)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func RedirectIfSession(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if SessionFrom(r.Context()) != nil {
			http.Redirect(w, r, "/notes", http.StatusFound)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func SessionFrom(ctx context.Context) *store.Session {
	sess, _ := ctx.Value(sessionKey).(*store.Session)
	return sess
}

func SetSessionCookie(w http.ResponseWriter, token primitive.ObjectID) {
	http.SetCookie(w, &http.Cookie{
		Name:     CookieName,
		Value:    token.Hex(),
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
}

func ClearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     CookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
	})
}
