package view

import "time"

type Flash struct {
	Kind    string
	Message string
}

type AuthPage struct {
	Flash Flash
	Error string
}

type NoteItem struct {
	ID       string
	Title    string
	DateText string
	Selected bool
}

type NotesPage struct {
	Notes       []NoteItem
	CurrentID   string
	CurrentTitle string
	CurrentBody string
	CurrentDate string
}

func FormatNoteDate(ms int64) string {
	if ms == 0 {
		return ""
	}
	return time.UnixMilli(ms).Format("2 January, 15:04")
}
