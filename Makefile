staging:
	cp .env_files/.env.staging .env.production
	docker build . -t learney-frontend
	eb deploy Staging-Learneyfrontend-env
	rm .env.production

prod:
	cp .env_files/.env.production .env.production
	docker build . -t learney-frontend
	eb deploy Learneyfrontend-env
	rm .env.production
