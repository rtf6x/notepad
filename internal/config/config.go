package config

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
)

type Config struct {
	Port      int
	PublicDir string
	MongoURI  string
	MongoDB   string
}

func Load() Config {
	port := 8901
	if v := os.Getenv("PORT"); v != "" {
		if p, err := strconv.Atoi(v); err == nil {
			port = p
		}
	}

	publicDir := "public"
	if v := os.Getenv("PUBLIC_DIR"); v != "" {
		publicDir = v
	}

	return Config{
		Port:      port,
		PublicDir: publicDir,
		MongoURI:  mongoURI(),
		MongoDB:   envOr("MONGO_DB", "notepad"),
	}
}

func mongoURI() string {
	if v := os.Getenv("MONGO_URI"); v != "" {
		return v
	}

	host := envOr("MONGO_HOST", "127.0.0.1")
	port := envOr("MONGO_PORT", "27017")
	db := envOr("MONGO_DB", "notepad")
	user := os.Getenv("MONGO_USER")
	pass := os.Getenv("MONGO_PASSWORD")

	if user != "" && pass != "" {
		return fmt.Sprintf(
			"mongodb://%s:%s@%s:%s/%s",
			url.QueryEscape(user),
			url.QueryEscape(pass),
			host,
			port,
			db,
		)
	}
	return fmt.Sprintf("mongodb://%s:%s/%s", host, port, db)
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
