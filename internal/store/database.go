package store

import "go.mongodb.org/mongo-driver/mongo"

func (s *Store) Database() *mongo.Database {
	return s.db
}
