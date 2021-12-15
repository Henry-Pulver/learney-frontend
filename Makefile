pretty:
	npx prettier -w .

build:
	npm run lint
	docker build . -t learney-frontend

staging:
	npm run lint
	eb deploy Staging-Learneyfrontend-env

prod:
	npm run lint
	eb deploy Learneyfrontend-env
