package main

import (
	"embed"
	"flag"
	"log"
	"runtime"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
)

//go:embed all:dist
var assets embed.FS

// Desktop belongs to this app, not to Labpane's React packages.
type Desktop struct{ frame string }

type WindowOptions struct {
	Frame    string `json:"frame"`
	Platform string `json:"platform"`
}

func (d *Desktop) WindowOptions() WindowOptions {
	return WindowOptions{Frame: d.frame, Platform: runtime.GOOS}
}

func main() {
	// Select at startup; both modes use native window actions.
	frame := flag.String("frame", "__LABPANE_FRAME__", "window frame: custom or native")
	flag.Parse()
	if *frame != "custom" && *frame != "native" {
		log.Fatal("frame must be custom or native")
	}
	app := &options.App{
		Title:       "__LABPANE_NAME__",
		Width:       1200,
		Height:      800,
		MinWidth:    640,
		MinHeight:   480,
		Frameless:   *frame == "custom" && runtime.GOOS != "darwin",
		AssetServer: &assetserver.Options{Assets: assets},
		Bind:        []interface{}{&Desktop{frame: *frame}},
	}
	if *frame == "custom" && runtime.GOOS == "darwin" {
		// Keep the real traffic lights, native resizing, and macOS fullscreen.
		app.Mac = &mac.Options{TitleBar: mac.TitleBarHiddenInset()}
	}
	if err := wails.Run(app); err != nil {
		log.Fatal(err)
	}
}
