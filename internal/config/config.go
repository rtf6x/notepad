package config

import (
	"flag"
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

	mongoHost string
	mongoPort string
	mongoUser string
	passSet   bool
	uriSource string
}

func Load() Config {
	portFlag := flag.Int("port", 0, "HTTP port (default 8901)")
	publicDir := flag.String("public-dir", "", "static assets directory")
	mongoURI := flag.String("mongo-uri", "", "MongoDB connection URI")
	mongoHost := flag.String("mongo-host", "", "MongoDB host")
	mongoPort := flag.String("mongo-port", "", "MongoDB port")
	mongoDB := flag.String("mongo-db", "", "MongoDB database")
	mongoUser := flag.String("mongo-user", "", "MongoDB user")
	mongoPass := flag.String("mongo-password", "", "MongoDB password")
	flag.Parse()

	cfg := Config{
		Port:      resolvePort(*portFlag),
		PublicDir: firstNonEmpty(*publicDir, os.Getenv("PUBLIC_DIR"), "public"),
		MongoDB:   firstNonEmpty(*mongoDB, os.Getenv("MONGO_DB"), "notepad"),
	}

	if u := firstNonEmpty(*mongoURI, os.Getenv("MONGO_URI")); u != "" {
		cfg.MongoURI = u
		if *mongoURI != "" {
			cfg.uriSource = "flag-uri"
		} else {
			cfg.uriSource = "env-uri"
		}
		return cfg
	}

	host := firstNonEmpty(*mongoHost, os.Getenv("MONGO_HOST"), "127.0.0.1")
	port := firstNonEmpty(*mongoPort, os.Getenv("MONGO_PORT"), "27017")
	user := firstNonEmpty(*mongoUser, os.Getenv("MONGO_USER"), "")
	pass := firstNonEmpty(*mongoPass, os.Getenv("MONGO_PASSWORD"), "")

	cfg.mongoHost = host
	cfg.mongoPort = port
	cfg.mongoUser = user
	cfg.passSet = pass != ""
	cfg.MongoURI = buildURI(host, port, cfg.MongoDB, user, pass)

	switch {
	case *mongoHost != "" || *mongoPort != "" || *mongoUser != "" || *mongoPass != "" || *mongoDB != "":
		cfg.uriSource = "flags"
	case os.Getenv("MONGO_HOST") != "" || os.Getenv("MONGO_PORT") != "" ||
		os.Getenv("MONGO_USER") != "" || os.Getenv("MONGO_PASSWORD") != "":
		cfg.uriSource = "env"
	default:
		cfg.uriSource = "default"
	}

	return cfg
}

func (c Config) MongoDescribe() string {
	if c.uriSource == "flag-uri" || c.uriSource == "env-uri" {
		return fmt.Sprintf("source=%s (uri hidden)", c.uriSource)
	}

	if c.mongoUser != "" && !c.passSet {
		return fmt.Sprintf(
			"source=%s host=%s port=%s db=%s user=%q password_set=false",
			c.uriSource, c.mongoHost, c.mongoPort, c.MongoDB, c.mongoUser,
		)
	}

	return fmt.Sprintf(
		"source=%s host=%s port=%s db=%s user=%q password_set=%v",
		c.uriSource, c.mongoHost, c.mongoPort, c.MongoDB, c.mongoUser, c.passSet,
	)
}

func resolvePort(flagVal int) int {
	if flagVal > 0 {
		return flagVal
	}
	if v := os.Getenv("PORT"); v != "" {
		if p, err := strconv.Atoi(v); err == nil && p > 0 {
			return p
		}
	}
	return 8901
}

func buildURI(host, port, db, user, pass string) string {
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

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if v != "" {
			return v
		}
	}
	return ""
}
