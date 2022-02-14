run-local:
	NEXT_PUBLIC_BACKEND_URL='http://localhost:8000' npm run dev

run-staging:
	NEXT_PUBLIC_BACKEND_URL='https://staging-api.learney.me' npm run dev

run: run-staging

pretty:
	npx prettier -w .

lint:
	npm run lint

tsc:
	tsc

pc: pretty lint tsc

build: lint tsc
	docker build . -t learney-frontend

staging: lint tsc
	eb deploy Staging-Learneyfrontend-env

prod: lint tsc
	eb deploy Learneyfrontend-env
