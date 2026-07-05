package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"

	"github.com/rtf6x/notepad/internal/config"
	"github.com/rtf6x/notepad/internal/handler"
	"github.com/rtf6x/notepad/internal/middleware"
	"github.com/rtf6x/notepad/internal/store"
)

func main() {
	cfg := config.Load()
	log.Printf("mongo: %s", cfg.MongoDescribe())

	ctx := context.Background()
	st, err := store.Connect(ctx, cfg.MongoURI, cfg.MongoDB)
	if err != nil {
		log.Fatalf("mongo: %v", err)
	}
	defer func() { _ = st.Close(context.Background()) }()

	web := handler.NewWeb(st)

	r := chi.NewRouter()
	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(middleware.WithSession(st))

	r.Mount("/", web.Routes())

	fileServer := http.FileServer(http.Dir(cfg.PublicDir))
	r.NotFound(fileServer.ServeHTTP)

	addr := fmt.Sprintf(":%d", cfg.Port)
	srv := &http.Server{
		Addr:              addr,
		Handler:           r,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		log.Printf("notepad listening on http://localhost%s (mongo connected)", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(shutdownCtx)
}
