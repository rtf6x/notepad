package migrate

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

const migrationsColl = "migrations"

type migration struct {
	id string
	up func(context.Context, *mongo.Database) error
}

type record struct {
	ID        string `bson:"_id"`
	AppliedAt int64  `bson:"appliedAt"`
}

var migrations = []migration{
	{id: "001_clean_overlay_scrollbars", up: cleanOverlayScrollbars},
}

func Run(ctx context.Context, db *mongo.Database) error {
	for _, m := range migrations {
		applied, err := isApplied(ctx, db, m.id)
		if err != nil {
			return fmt.Errorf("migration %s: check applied: %w", m.id, err)
		}
		if applied {
			log.Printf("migration %s: skip (already applied)", m.id)
			continue
		}

		log.Printf("migration %s: running", m.id)
		if err := m.up(ctx, db); err != nil {
			return fmt.Errorf("migration %s: %w", m.id, err)
		}
		if err := markApplied(ctx, db, m.id); err != nil {
			return fmt.Errorf("migration %s: mark applied: %w", m.id, err)
		}
		log.Printf("migration %s: done", m.id)
	}
	return nil
}

func isApplied(ctx context.Context, db *mongo.Database, id string) (bool, error) {
	err := db.Collection(migrationsColl).FindOne(ctx, bson.M{"_id": id}).Err()
	if err == mongo.ErrNoDocuments {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

func markApplied(ctx context.Context, db *mongo.Database, id string) error {
	_, err := db.Collection(migrationsColl).InsertOne(ctx, record{
		ID:        id,
		AppliedAt: time.Now().UnixMilli(),
	})
	return err
}
