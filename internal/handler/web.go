package handler

import (
	"net/http"
	"strings"

	"github.com/a-h/templ"
	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/rtf6x/notepad/internal/auth"
	"github.com/rtf6x/notepad/internal/middleware"
	"github.com/rtf6x/notepad/internal/store"
	"github.com/rtf6x/notepad/internal/view"
	"github.com/rtf6x/notepad/templates"
)

type Web struct {
	store *store.Store
}

func NewWeb(st *store.Store) *Web {
	return &Web{store: st}
}

func (h *Web) Routes() chi.Router {
	r := chi.NewRouter()

	r.With(middleware.RedirectIfSession).Get("/", h.loginForm)
	r.With(middleware.RedirectIfSession).Get("/login", h.loginForm)
	r.With(middleware.RedirectIfSession).Post("/login", h.loginPost)
	r.With(middleware.RedirectIfSession).Get("/register", h.registerForm)
	r.With(middleware.RedirectIfSession).Post("/register", h.registerPost)
	r.With(middleware.RedirectIfSession).Get("/forgot", h.forgotForm)
	r.With(middleware.RedirectIfSession).Post("/forgot", h.forgotPost)

	r.With(middleware.RequireSession).Get("/notes", h.notesIndex)
	r.With(middleware.RequireSession).Get("/notes/{id}", h.notesShow)
	r.With(middleware.RequireSession).Post("/notes/new", h.notesNew)
	r.With(middleware.RequireSession).Post("/notes/{id}/save", h.notesSave)
	r.With(middleware.RequireSession).Post("/notes/{id}/delete", h.notesDelete)
	r.Post("/logout", h.logoutPost)

	return r
}

func (h *Web) loginForm(w http.ResponseWriter, r *http.Request) {
	h.renderAuth(w, r, templates.Login(view.AuthPage{}))
}

func (h *Web) loginPost(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		h.authError(w, r, "Invalid form data")
		return
	}
	login := strings.TrimSpace(r.FormValue("login"))
	password := r.FormValue("password")
	if login == "" || password == "" {
		h.authError(w, r, "Login and password are required")
		return
	}

	u, err := h.store.FindUserByLogin(r.Context(), login)
	if err != nil || !auth.CheckPassword(u.PasswordHash, password) {
		h.authError(w, r, "Invalid login or password")
		return
	}

	token, err := h.store.CreateSession(r.Context(), u.ID)
	if err != nil {
		h.authError(w, r, "Internal error")
		return
	}
	middleware.SetSessionCookie(w, token)
	http.Redirect(w, r, "/notes", http.StatusFound)
}

func (h *Web) registerForm(w http.ResponseWriter, r *http.Request) {
	h.renderAuth(w, r, templates.Register(view.AuthPage{}))
}

func (h *Web) registerPost(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		h.authError(w, r, "Invalid form data")
		return
	}
	login := strings.TrimSpace(r.FormValue("login"))
	email := strings.TrimSpace(r.FormValue("email"))
	password := r.FormValue("password")

	if !auth.ValidateEmail(email) {
		h.authError(w, r, "Email is invalid")
		return
	}

	exists, err := h.store.UserExists(r.Context(), login, email)
	if err != nil {
		h.authError(w, r, "Internal error")
		return
	}
	if exists {
		h.authError(w, r, "Such entry exists, wow!")
		return
	}

	hash, err := auth.HashPassword(password)
	if err != nil {
		h.authError(w, r, "Internal error")
		return
	}
	if err := h.store.CreateUser(r.Context(), login, email, hash); err != nil {
		h.authError(w, r, "Internal error")
		return
	}

	page := view.AuthPage{Flash: view.Flash{Kind: "ok", Message: "Account created. Please log in."}}
	h.renderAuth(w, r, templates.Login(page))
}

func (h *Web) forgotForm(w http.ResponseWriter, r *http.Request) {
	h.renderAuth(w, r, templates.Forgot(view.AuthPage{}))
}

func (h *Web) forgotPost(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		h.authError(w, r, "Invalid form data")
		return
	}
	login := strings.TrimSpace(r.FormValue("login"))
	email := strings.TrimSpace(r.FormValue("email"))
	if login == "" && email == "" {
		h.authError(w, r, "Enter login or email")
		return
	}

	_, err := h.store.FindUserByLoginOrEmail(r.Context(), login, email)
	if err != nil {
		h.authError(w, r, "Internal error")
		return
	}

	page := view.AuthPage{Flash: view.Flash{Kind: "ok", Message: "If the account exists, instructions were sent."}}
	h.renderAuth(w, r, templates.Forgot(page))
}

func (h *Web) logoutPost(w http.ResponseWriter, r *http.Request) {
	if sess := middleware.SessionFrom(r.Context()); sess != nil {
		_ = h.store.DeleteSession(r.Context(), sess.ID)
	}
	middleware.ClearSessionCookie(w)
	http.Redirect(w, r, "/login", http.StatusFound)
}

func (h *Web) notesIndex(w http.ResponseWriter, r *http.Request) {
	sess := middleware.SessionFrom(r.Context())
	notes, err := h.store.ListNotes(r.Context(), sess.UserID)
	if err != nil {
		http.Error(w, "internal error", http.StatusBadGateway)
		return
	}
	if len(notes) == 0 {
		id, err := h.store.CreateNote(r.Context(), sess.UserID)
		if err != nil {
			http.Error(w, "internal error", http.StatusBadGateway)
			return
		}
		http.Redirect(w, r, "/notes/"+id.Hex(), http.StatusFound)
		return
	}
	http.Redirect(w, r, "/notes/"+notes[0].ID.Hex(), http.StatusFound)
}

func (h *Web) notesShow(w http.ResponseWriter, r *http.Request) {
	sess := middleware.SessionFrom(r.Context())
	noteID, err := primitive.ObjectIDFromHex(chi.URLParam(r, "id"))
	if err != nil {
		http.NotFound(w, r)
		return
	}

	current, err := h.store.FindNote(r.Context(), sess.UserID, noteID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.NotFound(w, r)
			return
		}
		http.Error(w, "internal error", http.StatusBadGateway)
		return
	}

	list, err := h.store.ListNotes(r.Context(), sess.UserID)
	if err != nil {
		http.Error(w, "internal error", http.StatusBadGateway)
		return
	}

	items := make([]view.NoteItem, 0, len(list))
	for _, n := range list {
		items = append(items, view.NoteItem{
			ID:       n.ID.Hex(),
			Title:    n.Title,
			DateText: view.FormatNoteDate(n.Date),
			Selected: n.ID == current.ID,
		})
	}

	page := view.NotesPage{
		Notes:        items,
		CurrentID:    current.ID.Hex(),
		CurrentTitle: current.Title,
		CurrentBody:  current.Body,
		CurrentDate:  view.FormatNoteDate(current.Date),
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	templates.Notes(page).Render(r.Context(), w)
}

func (h *Web) notesNew(w http.ResponseWriter, r *http.Request) {
	sess := middleware.SessionFrom(r.Context())
	id, err := h.store.CreateNote(r.Context(), sess.UserID)
	if err != nil {
		http.Error(w, "internal error", http.StatusBadGateway)
		return
	}
	http.Redirect(w, r, "/notes/"+id.Hex(), http.StatusFound)
}

func (h *Web) notesSave(w http.ResponseWriter, r *http.Request) {
	sess := middleware.SessionFrom(r.Context())
	noteID, err := primitive.ObjectIDFromHex(chi.URLParam(r, "id"))
	if err != nil {
		http.NotFound(w, r)
		return
	}
	if err := r.ParseForm(); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}
	title := r.FormValue("title")
	body := r.FormValue("note")
	if err := h.store.UpdateNote(r.Context(), sess.UserID, noteID, title, body); err != nil {
		if err == mongo.ErrNoDocuments {
			http.NotFound(w, r)
			return
		}
		http.Error(w, "internal error", http.StatusBadGateway)
		return
	}
	http.Redirect(w, r, "/notes/"+noteID.Hex(), http.StatusFound)
}

func (h *Web) notesDelete(w http.ResponseWriter, r *http.Request) {
	sess := middleware.SessionFrom(r.Context())
	noteID, err := primitive.ObjectIDFromHex(chi.URLParam(r, "id"))
	if err != nil {
		http.NotFound(w, r)
		return
	}
	if err := h.store.DeleteNote(r.Context(), sess.UserID, noteID); err != nil {
		if err == mongo.ErrNoDocuments {
			http.NotFound(w, r)
			return
		}
		http.Error(w, "internal error", http.StatusBadGateway)
		return
	}
	http.Redirect(w, r, "/notes", http.StatusFound)
}

func (h *Web) authError(w http.ResponseWriter, r *http.Request, msg string) {
	page := view.AuthPage{Error: msg}
	switch {
	case strings.HasPrefix(r.URL.Path, "/register"):
		h.renderAuth(w, r, templates.Register(page))
	case strings.HasPrefix(r.URL.Path, "/forgot"):
		h.renderAuth(w, r, templates.Forgot(page))
	default:
		h.renderAuth(w, r, templates.Login(page))
	}
}

func (h *Web) renderAuth(w http.ResponseWriter, r *http.Request, c templ.Component) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	c.Render(r.Context(), w)
}
