#!/usr/bin/env bash
# Builds e2e/desktop, opens the built example site in its Wails window, and checks that the
# window's webview loads it. Run from the repository root after `bun run --cwd example build`.
# `native` keeps the system title bar; `custom` makes the workspace the title bar, and the page
# reports whether the window's controls landed where they belong.
set -euo pipefail

frame=${1:-native}

here=$(cd "$(dirname "$0")" && pwd)
out=desktop-smoke/$frame
rm -rf "${out:?}"
mkdir -p "$out"
config=$(mktemp -d)

case "$(uname -s)" in
  Linux*)
    os=linux
    app=labpane-desktop
    tags=desktop,production,webkit2_41
    export CGO_ENABLED=1 XDG_CONFIG_HOME="$config" XDG_DATA_HOME="$config" XDG_CACHE_HOME="$config"
    ;;
  Darwin*)
    os=macos
    app=labpane-desktop
    tags=desktop,production
    export CGO_ENABLED=1 CGO_CFLAGS=-mmacosx-version-min=10.13
    export CGO_LDFLAGS="-framework UniformTypeIdentifiers -mmacosx-version-min=10.13"
    ;;
  MINGW* | MSYS* | CYGWIN*)
    os=windows
    app=labpane-desktop.exe
    tags=desktop,production
    ;;
  *)
    echo "unsupported OS: $(uname -s)" >&2
    exit 1
    ;;
esac

(cd "$here" && go build -tags "$tags" -o "$app" .)

if [ "$os" = linux ]; then
  export DISPLAY=:99
  Xvfb :99 -screen 0 1440x900x24 > "$out/xvfb.log" 2>&1 &
  xvfb=$!
  sleep 1
fi

"$here/$app" -site example/dist -frame "$frame" > "$out/app.log" 2>&1 &
pid=$!

stop() {
  if [ "$os" = windows ]; then
    taskkill //F //T //PID "$(cat "/proc/$pid/winpid")" > /dev/null 2>&1 || true
  fi
  kill "$pid" 2> /dev/null || true
  if [ "$os" = linux ]; then
    kill "$xvfb" 2> /dev/null || true
  fi
}
trap stop EXIT

fail() {
  echo "desktop smoke test failed: $1" >&2
  cat "$out/app.log" >&2
  exit 1
}

url=
for _ in $(seq 60); do
  url=$(grep -o 'http://127\.0\.0\.1:[0-9]*' "$out/app.log" | head -1 || true)
  [ -n "$url" ] && break
  kill -0 "$pid" 2> /dev/null || fail "the app exited before serving"
  sleep 1
done
[ -n "$url" ] || fail "the app did not start serving within 60 seconds"
echo "serving on $url"

curl -fsS "$url/" -o "$out/index.html" || fail "$url/ did not answer"
grep -q 'id="root"' "$out/index.html" || fail "$url/ did not return the example site"

# curl only fetches the page, so requests for the site's scripts come from the window's webview
loaded=
for _ in $(seq 30); do
  loaded=$(grep -c 'GET /assets/.*\.js' "$out/app.log" || true)
  [ "$loaded" -gt 0 ] && break
  kill -0 "$pid" 2> /dev/null || fail "the app exited before its window loaded"
  sleep 1
done
[ "$loaded" -gt 0 ] || fail "the window did not load the site's scripts within 30 seconds"
echo "window loaded $loaded scripts"

if [ "$frame" = custom ]; then
  for _ in $(seq 20); do
    grep -q 'layout \(ok\|failed\)' "$out/app.log" && break
    sleep 1
  done
  grep -q 'layout ok' "$out/app.log" ||
    fail "$(grep -o 'layout failed.*' "$out/app.log" || echo 'the page did not report its layout')"
  grep -o 'layout ok.*' "$out/app.log"
  if [ "$os" = macos ]; then
    grep -q 'traffic-lights' "$out/app.log" || fail "the page did not report its title bar for the traffic lights"
  fi
fi

sleep 5
kill -0 "$pid" 2> /dev/null || fail "the app exited after its window loaded"

# Screenshots only on CI, so a local run never captures a developer's screen
[ -n "${CI:-}" ] && case $os in
  linux) command -v import > /dev/null && import -window root "$out/window.png" || true ;;
  macos) screencapture -x "$out/window.png" || true ;;
  windows) powershell -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms, System.Drawing; \$b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds; \$i = New-Object System.Drawing.Bitmap \$b.Width, \$b.Height; [System.Drawing.Graphics]::FromImage(\$i).CopyFromScreen(\$b.Location, [System.Drawing.Point]::Empty, \$b.Size); \$i.Save('$out\\window.png')" || true ;;
esac

echo "desktop smoke test passed on $os with the $frame title bar"
