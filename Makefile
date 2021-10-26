staging:
	docker build . -t learney-frontend
	eb deploy Staging-Learneyfrontend-env

prod:
	docker build . -t learney-frontend
	eb deploy Learneyfrontend-env
