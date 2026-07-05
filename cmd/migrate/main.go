package main

import (
	"context"
	"log"

	"github.com/rtf6x/notepad/internal/config"
	"github.com/rtf6x/notepad/internal/migrate"
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

	if err := migrate.Run(ctx, st.Database()); err != nil {
		log.Fatalf("migrate: %v", err)
	}
}
