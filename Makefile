.PHONY: build test lint dev

dev:
	npm run dev

build:
	npm run build
	@echo "Build succeeded"

test:
	npm test

lint:
	npm run lint
