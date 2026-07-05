package auth

import (
	"crypto/md5"
	"crypto/subtle"
	"encoding/hex"
	"regexp"

	"golang.org/x/crypto/bcrypt"
)

var emailRe = regexp.MustCompile(`^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$`)

func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func CheckPassword(hash, password string) bool {
	if bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil {
		return true
	}
	// Legacy Mongo users stored MD5 hex.
	if len(hash) == 32 {
		sum := md5.Sum([]byte(password))
		legacy := hex.EncodeToString(sum[:])
		return subtle.ConstantTimeCompare([]byte(hash), []byte(legacy)) == 1
	}
	return false
}

func ValidateEmail(email string) bool {
	return emailRe.MatchString(email)
}
