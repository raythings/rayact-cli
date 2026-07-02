import { createRequire } from 'node:module';

export function printHelp(): void {
  console.log(`
Rayact CLI — cross-platform React + QuickJS + raylib

Usage:
  rayact <command> [options]

Commands:
  init [name]           Create a new Rayact app (alias for create-rayact-app)
  dev                   Start dev server + bundler + TUI
  dev-app               Install + launch the prebuilt dev app on a device/simulator
  prebuild              Scaffold native android/ + ios/ shells (prebuilt engine linked)
  start                 Run native host with built bundle or dev server
  run:desktop           Start desktop host (dev server or dist/bundle.js)
  run:android           Start Android with adb reverse + optional install
  run:ios               Build and run iOS simulator (when configured)
  build                 Build release/debug bundle
  build --android       Build bundle + Android APK (add --install to deploy)
  build --ios           Build bundle + iOS app (add --install for simulator)
  build --desktop       Build bundle + package self-contained desktop app
  build --web           Build a web bundle (platform=web) for the WASM/WebGPU host
  export                Build production bundle (alias for build --release)
  compile <in> <out>    Compile JS bundle to QuickJS bytecode (.qjsbc)
  verify                Run desktop verification script
  verify --android      Run Android verification script
  verify --ios          Run iOS verification script

Options:
  --host <host>         Dev server host (default: 0.0.0.0)
  --port <port>         Dev server port (default: 8081)
  --entry <path>        App entry (default: src/App.tsx)
  --platform <name>     Target platform: desktop | android | ios
  --template <name>     init template: default | blank
  --ios-simulator       dev-app: target the iOS simulator
  --ios-device          dev-app: download the unsigned device IPA
  --production          prebuild: scaffold without the dev-client launcher
  --force               prebuild: overwrite existing android/ios projects
  --dev                 start: connect to dev server instead of bundle
  --android             dev/run: adb reverse ports; build: assemble APK
  --ios                 build: assemble iOS app via xcodebuild
  --desktop             build: copy native host + runtime files into out dir
  --install             build android/ios: install + launch after build
  --minify / --no-minify
  --bytecode / --no-bytecode
  --release / --debug
  -h, --help            Show help
  -v, --version         Show version

Examples:
  npx create-rayact-app my-app
  rayact dev-app --android
  rayact prebuild && rayact build --debug --android --install
  cd my-app && npm install && npm run dev
  rayact start --dev
  rayact run:desktop
  rayact build --release
  rayact build --release --desktop
  rayact build --release --android --install
  rayact build --debug --ios --install
  rayact export
`.trim());
}

export function printVersion(): void {
  const require = createRequire(import.meta.url);
  const { version } = require('../package.json') as { version: string };
  console.log(`@rayact/cli ${version}`);
}
