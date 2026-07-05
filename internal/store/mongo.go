package store

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	usersColl   = "users"
	tokensColl  = "tokens"
	notesColl   = "notes"
	defaultDB   = "notepad"
	connectWait = 10 * time.Second
)

type Store struct {
	db *mongo.Database
}

type User struct {
	ID           primitive.ObjectID `bson:"_id"`
	Login        string             `bson:"login"`
	Email        string             `bson:"email"`
	PasswordHash string             `bson:"password"`
	RegisterDate int64              `bson:"registerDate"`
}

type Session struct {
	ID        primitive.ObjectID `bson:"_id"`
	UserID    primitive.ObjectID `bson:"userId"`
	LoginDate int64              `bson:"loginDate"`
}

type Note struct {
	ID     primitive.ObjectID `bson:"_id"`
	UserID primitive.ObjectID `bson:"userId"`
	Title  string             `bson:"title"`
	Body   string             `bson:"note"`
	Date   int64              `bson:"date"`
}

type NoteListItem struct {
	ID    primitive.ObjectID `bson:"_id"`
	Title string             `bson:"title"`
	Date  int64              `bson:"date"`
}

func Connect(ctx context.Context, uri, dbName string) (*Store, error) {
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}
	pingCtx, cancel := context.WithTimeout(ctx, connectWait)
	defer cancel()
	if err := client.Ping(pingCtx, nil); err != nil {
		return nil, err
	}

	if dbName == "" {
		dbName = defaultDB
	}

	return &Store{db: client.Database(dbName)}, nil
}

func (s *Store) Close(ctx context.Context) error {
	return s.db.Client().Disconnect(ctx)
}

func (s *Store) FindUserByLogin(ctx context.Context, login string) (*User, error) {
	var u User
	err := s.db.Collection(usersColl).FindOne(ctx, bson.M{"login": login}).Decode(&u)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (s *Store) FindUserByLoginOrEmail(ctx context.Context, login, email string) (*User, error) {
	filter := bson.M{}
	if email != "" {
		filter["email"] = email
	} else {
		filter["login"] = login
	}
	var u User
	err := s.db.Collection(usersColl).FindOne(ctx, filter).Decode(&u)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (s *Store) UserExists(ctx context.Context, login, email string) (bool, error) {
	n, err := s.db.Collection(usersColl).CountDocuments(ctx, bson.M{
		"$or": []bson.M{{"login": login}, {"email": email}},
	})
	return n > 0, err
}

func (s *Store) CreateUser(ctx context.Context, login, email, passwordHash string) error {
	_, err := s.db.Collection(usersColl).InsertOne(ctx, bson.M{
		"_id":          primitive.NewObjectID(),
		"login":        login,
		"email":        email,
		"password":     passwordHash,
		"registerDate": time.Now().UnixMilli(),
	})
	return err
}

func (s *Store) CreateSession(ctx context.Context, userID primitive.ObjectID) (primitive.ObjectID, error) {
	id := primitive.NewObjectID()
	_, err := s.db.Collection(tokensColl).InsertOne(ctx, bson.M{
		"_id":       id,
		"userId":    userID,
		"loginDate": time.Now().UnixMilli(),
	})
	return id, err
}

func (s *Store) FindSession(ctx context.Context, id primitive.ObjectID) (*Session, error) {
	var sess Session
	err := s.db.Collection(tokensColl).FindOne(ctx, bson.M{"_id": id}).Decode(&sess)
	if err != nil {
		return nil, err
	}
	return &sess, nil
}

func (s *Store) DeleteSession(ctx context.Context, id primitive.ObjectID) error {
	_, err := s.db.Collection(tokensColl).DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (s *Store) ListNotes(ctx context.Context, userID primitive.ObjectID) ([]NoteListItem, error) {
	opts := options.Find().
		SetSort(bson.D{{Key: "date", Value: -1}}).
		SetProjection(bson.M{"note": 0, "userId": 0})

	cur, err := s.db.Collection(notesColl).Find(ctx, bson.M{"userId": userID}, opts)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	out := make([]NoteListItem, 0)
	for cur.Next(ctx) {
		var n NoteListItem
		if err := cur.Decode(&n); err != nil {
			return nil, err
		}
		out = append(out, n)
	}
	return out, cur.Err()
}

func (s *Store) FindNote(ctx context.Context, userID, noteID primitive.ObjectID) (*Note, error) {
	var n Note
	err := s.db.Collection(notesColl).FindOne(ctx, bson.M{
		"_id":    noteID,
		"userId": userID,
	}).Decode(&n)
	if err != nil {
		return nil, err
	}
	return &n, nil
}

func (s *Store) CreateNote(ctx context.Context, userID primitive.ObjectID) (primitive.ObjectID, error) {
	id := primitive.NewObjectID()
	_, err := s.db.Collection(notesColl).InsertOne(ctx, bson.M{
		"_id":    id,
		"userId": userID,
		"title":  "",
		"note":   "",
		"date":   time.Now().UnixMilli(),
	})
	return id, err
}

func (s *Store) UpdateNote(ctx context.Context, userID, noteID primitive.ObjectID, title, body string) error {
	existing, err := s.FindNote(ctx, userID, noteID)
	if err != nil {
		return err
	}
	if NormalizeNoteTitle(existing.Title) == NormalizeNoteTitle(title) &&
		NormalizeNoteBody(existing.Body) == NormalizeNoteBody(body) {
		return nil
	}

	title = NormalizeNoteTitle(title)
	body = NormalizeNoteBody(body)

	res, err := s.db.Collection(notesColl).UpdateOne(ctx,
		bson.M{"_id": noteID, "userId": userID},
		bson.M{"$set": bson.M{
			"title": title,
			"note":  body,
			"date":  time.Now().UnixMilli(),
		}},
	)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}

func (s *Store) UpdateNoteTitle(ctx context.Context, userID, noteID primitive.ObjectID, title string) error {
	res, err := s.db.Collection(notesColl).UpdateOne(ctx,
		bson.M{"_id": noteID, "userId": userID},
		bson.M{"$set": bson.M{
			"title": title,
			"date":  time.Now().UnixMilli(),
		}},
	)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}

func (s *Store) DeleteNote(ctx context.Context, userID, noteID primitive.ObjectID) error {
	res, err := s.db.Collection(notesColl).DeleteOne(ctx, bson.M{
		"_id":    noteID,
		"userId": userID,
	})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}
