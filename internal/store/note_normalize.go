package store

import "strings"

func normalizeNoteBody(s string) string {
	s = strings.TrimSpace(s)
	switch strings.ToLower(s) {
	case "", "<br>", "<br/>", "<div><br></div>", "<div><br/></div>", "<p><br></p>", "<p><br/></p>":
		return ""
	}
	return s
}

func normalizeNoteTitle(s string) string {
	return strings.TrimSpace(s)
}
