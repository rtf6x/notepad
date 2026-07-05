package migrate

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/rtf6x/notepad/internal/store"
)

func cleanOverlayScrollbars(ctx context.Context, db *mongo.Database) error {
	notes := db.Collection("notes")
	filter := bson.M{
		"note": bson.M{
			"$regex":   "os-scrollbar|overlayscrollbars",
			"$options": "i",
		},
	}

	cur, err := notes.Find(ctx, filter)
	if err != nil {
		return err
	}
	defer cur.Close(ctx)

	var updated int
	for cur.Next(ctx) {
		var doc struct {
			ID   primitive.ObjectID `bson:"_id"`
			Body string             `bson:"note"`
		}
		if err := cur.Decode(&doc); err != nil {
			return err
		}

		cleaned := store.NormalizeNoteBody(doc.Body)
		if cleaned == doc.Body {
			continue
		}

		if _, err := notes.UpdateOne(ctx,
			bson.M{"_id": doc.ID},
			bson.M{"$set": bson.M{"note": cleaned}},
		); err != nil {
			return err
		}
		updated++
	}
	if err := cur.Err(); err != nil {
		return err
	}

	log.Printf("migration 001_clean_overlay_scrollbars: updated %d note(s)", updated)
	return nil
}
