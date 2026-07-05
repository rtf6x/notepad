package store

import (
	"bytes"
	"strings"

	"golang.org/x/net/html"
	"golang.org/x/net/html/atom"
)

func stripOverlayScrollbarMarkup(s string) string {
	lower := strings.ToLower(s)
	if !strings.Contains(lower, "os-scrollbar") && !strings.Contains(lower, "overlayscrollbars") {
		return s
	}

	parent := &html.Node{Type: html.ElementNode, Data: "div", DataAtom: atom.Div}
	nodes, err := html.ParseFragment(strings.NewReader(s), parent)
	if err != nil {
		return s
	}
	for _, node := range nodes {
		parent.AppendChild(node)
	}

	removeOsScrollbars(parent)
	for leaf := findLeafOsWrapper(parent); leaf != nil; leaf = findLeafOsWrapper(parent) {
		unwrapNode(leaf)
	}

	var buf bytes.Buffer
	for child := parent.FirstChild; child != nil; child = child.NextSibling {
		if err := html.Render(&buf, child); err != nil {
			return s
		}
	}
	return buf.String()
}

func removeOsScrollbars(parent *html.Node) {
	for child := parent.FirstChild; child != nil; {
		next := child.NextSibling
		if isOsScrollbarNode(child) || isOsPaddingNode(child) || isOsHostNode(child) {
			parent.RemoveChild(child)
		} else {
			removeOsScrollbars(child)
		}
		child = next
	}
}

func findLeafOsWrapper(parent *html.Node) *html.Node {
	var found *html.Node
	var walk func(*html.Node)
	walk = func(node *html.Node) {
		if found != nil {
			return
		}
		if isOsViewportNode(node) || isOsContentNode(node) {
			if !hasOsWrapperDescendant(node) {
				found = node
				return
			}
		}
		for child := node.FirstChild; child != nil; child = child.NextSibling {
			walk(child)
		}
	}
	walk(parent)
	return found
}

func hasOsWrapperDescendant(node *html.Node) bool {
	for child := node.FirstChild; child != nil; child = child.NextSibling {
		if isOsViewportNode(child) || isOsContentNode(child) {
			return true
		}
		if hasOsWrapperDescendant(child) {
			return true
		}
	}
	return false
}

func unwrapNode(node *html.Node) {
	parent := node.Parent
	if parent == nil {
		return
	}

	for child := node.FirstChild; child != nil; {
		next := child.NextSibling
		node.RemoveChild(child)
		parent.InsertBefore(child, node)
		child = next
	}
	parent.RemoveChild(node)
}

func isOsScrollbarNode(node *html.Node) bool {
	return node.Type == html.ElementNode && hasClassToken(node, "os-scrollbar")
}

func isOsPaddingNode(node *html.Node) bool {
	return node.Type == html.ElementNode && hasAttr(node, "data-overlayscrollbars-padding")
}

func isOsHostNode(node *html.Node) bool {
	return node.Type == html.ElementNode && hasAttr(node, "data-overlayscrollbars")
}

func isOsViewportNode(node *html.Node) bool {
	return node.Type == html.ElementNode && hasAttr(node, "data-overlayscrollbars-viewport")
}

func isOsContentNode(node *html.Node) bool {
	return node.Type == html.ElementNode && hasAttr(node, "data-overlayscrollbars-content")
}

func hasAttr(node *html.Node, key string) bool {
	for _, attr := range node.Attr {
		if attr.Key == key {
			return true
		}
	}
	return false
}

func hasClassToken(node *html.Node, token string) bool {
	for _, attr := range node.Attr {
		if attr.Key != "class" {
			continue
		}
		for _, className := range strings.Fields(attr.Val) {
			if className == token {
				return true
			}
		}
	}
	return false
}

func NormalizeNoteBody(s string) string {
	s = stripOverlayScrollbarMarkup(s)
	s = strings.TrimSpace(s)
	switch strings.ToLower(s) {
	case "", "<br>", "<br/>", "<div><br></div>", "<div><br/></div>", "<p><br></p>", "<p><br/></p>":
		return ""
	}
	return s
}

func NormalizeNoteTitle(s string) string {
	return strings.TrimSpace(s)
}
