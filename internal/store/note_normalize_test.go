package store

import (
	"strings"
	"testing"
)

func TestNormalizeNoteBodyStripsOverlayScrollbarsMarkup(t *testing.T) {
	const corrupted = `<div class="" data-overlayscrollbars-viewport="scrollbarHidden overflowXHidden overflowYHidden" tabindex="-1" style="margin-right: -60px;"><div class="" data-overlayscrollbars-viewport="scrollbarHidden overflowXHidden overflowYHidden" tabindex="-1">Hi there!</div><div class="os-scrollbar os-scrollbar-vertical os-theme-notepad"><div class="os-scrollbar-track"><div class="os-scrollbar-handle"></div></div></div></div>`

	got := NormalizeNoteBody(corrupted)
	if !strings.Contains(got, "Hi there!") {
		t.Fatalf("expected note text to survive sanitization, got %q", got)
	}
	if strings.Contains(strings.ToLower(got), "os-scrollbar") {
		t.Fatalf("expected scrollbar markup to be removed, got %q", got)
	}
	if strings.Contains(strings.ToLower(got), "data-overlayscrollbars-viewport") {
		t.Fatalf("expected viewport wrappers to be removed, got %q", got)
	}
}
