pretty:
	npx prettier -w .

lint:
	npm run lint

build: lint
	docker build . -t learney-frontend

staging: lint
	eb deploy Staging-Learneyfrontend-env

prod: lint
	eb deploy Learneyfrontend-env
