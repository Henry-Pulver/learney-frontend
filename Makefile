staging:
	npx prettier -w .
	npm run lint
	docker build . -t learney-frontend
	eb deploy Staging-Learneyfrontend-env

prod:
	npx prettier -w .
	npm run lint
	docker build . -t learney-frontend
	eb deploy Learneyfrontend-env
