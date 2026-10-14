// Command desktop opens the built example site in a Wails window, for the desktop smoke test
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"runtime"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

func main() {
	site := flag.String("site", "../../example/dist", "directory with the built example site")
	frame := flag.String("frame", "native", "native for the system title bar, or custom for the workspace as the title bar")
	flag.Parse()
	if _, err := os.Stat(*site + "/index.html"); err != nil {
		log.Fatalf("no built site in %s; run `bun run --cwd example build` first", *site)
	}
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		log.Fatal(err)
	}
	files := http.FileServer(http.Dir(*site))
	// Requests are logged, so the smoke test can see the window load the site's scripts
	logged := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s", r.Method, r.URL.Path)
		files.ServeHTTP(w, r)
	})
	go func() { log.Fatal(http.Serve(listener, logged)) }()
	url := "http://" + listener.Addr().String()
	fmt.Fprintln(os.Stderr, "serving on", url)

	profile, err := os.MkdirTemp("", "labpane-desktop-")
	if err != nil {
		log.Fatal(err)
	}
	defer os.RemoveAll(profile)
	// custom opens the example's desktop page in a window without the system title bar
	start := url + "/"
	if *frame == "custom" {
		platform := map[string]string{"darwin": "macos", "windows": "windows", "linux": "linux"}[runtime.GOOS]
		start = url + "/desktop/?platform=" + platform
	}
	app := &options.App{
		Title:     "Labpane",
		Frameless: *frame == "custom" && runtime.GOOS != "darwin",
		// Small enough for a CI runner's screen, so the window is never mistaken for full screen
		Width:                  960,
		Height:                 640,
		BindingsAllowedOrigins: url,
		AssetServer: &assetserver.Options{
			Handler: http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
				w.Header().Set("Content-Type", "text/html; charset=utf-8")
				fmt.Fprintf(w, "<script>location.replace(%q)</script>", start)
			}),
		},
		OnStartup: func(ctx context.Context) {
			wailsruntime.EventsOn(ctx, "layout", reportLayout)
			wailsruntime.EventsOn(ctx, "traffic-lights", func(data ...any) {
				log.Printf("traffic-lights %v", data)
			})
		},
		Windows: &windows.Options{WebviewUserDataPath: profile},
	}
	if *frame == "custom" {
		app.Mac = &mac.Options{TitleBar: mac.TitleBarHiddenInset()}
	}
	// The window starts on a page Wails serves, which moves it to the site
	if err := wails.Run(app); err != nil {
		log.Fatal(err)
	}
}

// reportLayout logs the desktop page's check of where the window's controls landed
func reportLayout(data ...any) {
	var report map[string]any
	if len(data) == 1 {
		report, _ = data[0].(map[string]any)
	}
	problems, _ := report["problems"].([]any)
	if report == nil || len(problems) > 0 {
		log.Printf("layout failed: %v", data)
		return
	}
	log.Printf("layout ok on %v", report["platform"])
}
