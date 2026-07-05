package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/rtf6x/notepad/internal/middleware"
)

type noteListJSON struct {
	ID    string `json:"id"`
	Title string `json:"title"`
	Date  int64  `json:"date"`
}

type noteJSON struct {
	ID    string `json:"id"`
	Title string `json:"title"`
	Body  string `json:"body"`
	Date  int64  `json:"date"`
}

type noteUpdateJSON struct {
	Title string `json:"title"`
	Body  string `json:"body"`
}

type createNoteJSON struct {
	ID string `json:"id"`
}

func (h *Web) APIRoutes() chi.Router {
	r := chi.NewRouter()
	r.Use(middleware.RequireSessionAPI)

	r.Get("/notes", h.apiListNotes)
	r.Post("/notes", h.apiCreateNote)
	r.Get("/notes/{id}", h.apiGetNote)
	r.Put("/notes/{id}", h.apiUpdateNote)
	r.Delete("/notes/{id}", h.apiDeleteNote)

	return r
}

func (h *Web) apiListNotes(w http.ResponseWriter, r *http.Request) {
	sess := middleware.SessionFrom(r.Context())
	list, err := h.store.ListNotes(r.Context(), sess.UserID)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "internal error"})
		return
	}

	out := make([]noteListJSON, 0, len(list))
	for _, n := range list {
		out = append(out, noteListJSON{
			ID:    n.ID.Hex(),
			Title: n.Title,
			Date:  n.Date,
		})
	}
	writeJSON(w, http.StatusOK, out)
}

func (h *Web) apiGetNote(w http.ResponseWriter, r *http.Request) {
	sess := middleware.SessionFrom(r.Context())
	noteID, err := primitive.ObjectIDFromHex(chi.URLParam(r, "id"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid id"})
		return
	}

	note, err := h.store.FindNote(r.Context(), sess.UserID, noteID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
			return
		}
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "internal error"})
		return
	}

	writeJSON(w, http.StatusOK, noteJSON{
		ID:    note.ID.Hex(),
		Title: note.Title,
		Body:  note.Body,
		Date:  note.Date,
	})
}

func (h *Web) apiCreateNote(w http.ResponseWriter, r *http.Request) {
	sess := middleware.SessionFrom(r.Context())
	id, err := h.store.CreateNote(r.Context(), sess.UserID)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "internal error"})
		return
	}
	writeJSON(w, http.StatusCreated, createNoteJSON{ID: id.Hex()})
}

func (h *Web) apiUpdateNote(w http.ResponseWriter, r *http.Request) {
	sess := middleware.SessionFrom(r.Context())
	noteID, err := primitive.ObjectIDFromHex(chi.URLParam(r, "id"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid id"})
		return
	}

	var payload noteUpdateJSON
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	if err := h.store.UpdateNote(r.Context(), sess.UserID, noteID, payload.Title, payload.Body); err != nil {
		if err == mongo.ErrNoDocuments {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
			return
		}
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "internal error"})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Web) apiDeleteNote(w http.ResponseWriter, r *http.Request) {
	sess := middleware.SessionFrom(r.Context())
	noteID, err := primitive.ObjectIDFromHex(chi.URLParam(r, "id"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid id"})
		return
	}

	if err := h.store.DeleteNote(r.Context(), sess.UserID, noteID); err != nil {
		if err == mongo.ErrNoDocuments {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
			return
		}
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "internal error"})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
