package store

import (
	"regexp"
	"strings"
)

var osScrollbarBlockRe = regexp.MustCompile(`(?is)<div[^>]*\bos-scrollbar\b[^>]*>.*?</div>`)

func stripOverlayScrollbarMarkup(s string) string {
	lower := strings.ToLower(s)
	if !strings.Contains(lower, "os-scrollbar") && !strings.Contains(lower, "overlayscrollbars") {
		return s
	}
	for osScrollbarBlockRe.MatchString(s) {
		s = osScrollbarBlockRe.ReplaceAllString(s, "")
	}
	return s
}

func normalizeNoteBody(s string) string {
	s = stripOverlayScrollbarMarkup(s)
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
