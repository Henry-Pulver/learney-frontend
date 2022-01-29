run-local:
	NEXT_PUBLIC_BACKEND_URL='http://localhost:8000' npm run dev

run-staging:
	NEXT_PUBLIC_BACKEND_URL='https://staging-api.learney.me' npm run dev

run: run-staging

pretty:
	npx prettier -w .

lint:
	npm run lint

pc: pretty lint

build: lint
	docker build . -t learney-frontend

staging: lint
	eb deploy Staging-Learneyfrontend-env

prod: lint
	eb deploy Learneyfrontend-env
