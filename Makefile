# ── expo-mathjax Makefile ──────────────────────────────────────────────────
# Targets:
#   make install        Install root dependencies
#   make build          Compile TypeScript → build/
#   make watch          Compile in watch mode
#   make test           Run Jest unit tests
#   make test-watch     Run Jest in interactive watch mode
#   make lint           Type-check without emitting files
#
#   make example/install   Install example app dependencies
#   make example/start     Start Expo dev server (Metro bundler)
#   make example/ios       Build & run on iOS simulator
#   make example/android   Build & run on Android emulator/device
#
#   make dev            build (watch) + example/start in parallel
#   make clean          Remove build output and example node_modules cache
# ────────────────────────────────────────────────────────────────────────────

.PHONY: install build watch test test-watch lint \
        example/install example/start example/ios example/android \
        dev clean

# ── Root module ──────────────────────────────────────────────────────────────

install:
	npm install

build: install
	npm run build

watch: install
	npx tsc --watch

test: install
	npm test -- --no-coverage

test-watch: install
	npm run test:watch

lint: install
	npx tsc --noEmit

# ── Example app ──────────────────────────────────────────────────────────────

example/install: build
	cd example && npm install --legacy-peer-deps

example/start: example/install
	cd example && npx expo start

example/ios: example/install
	cd example && npx expo run:ios

example/android: example/install
	cd example && npx expo run:android

# ── Combined dev workflow ─────────────────────────────────────────────────────
# Starts TypeScript watch + Expo dev server in parallel.
# Ctrl-C stops both.

dev: install example/install
	npx tsc --watch & \
	cd example && npm run start; \
	kill %1 2>/dev/null; wait

# ── Clean ─────────────────────────────────────────────────────────────────────

clean:
	rm -rf build
	rm -rf example/node_modules
	rm -rf example/.expo
