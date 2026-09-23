.PHONY: build test lint e2e dev

dev:
	npm run dev

build:
	npm run build
	@echo "Build succeeded"

test:
	npm test

e2e:
	npm run e2e

lint:
	npm run lint
