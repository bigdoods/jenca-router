.PHONY: images test

VERSION = 1.0.0

# build the docker images - the dev version includes development node modules
images:
	docker build -t jenca-cloud/jenca-router:latest .
	docker build -f Dockerfile.dev -t jenca-cloud/jenca-router:latest-dev .
	docker rmi jenca-cloud/jenca-router:$(VERSION) jenca-cloud/jenca-router:$(VERSION)-dev
	docker tag jenca-cloud/jenca-router:latest jenca-cloud/jenca-router:$(VERSION)
	docker tag jenca-cloud/jenca-router:latest-dev jenca-cloud/jenca-router:$(VERSION)-dev

test:
	docker run -ti --rm \
		--entrypoint "node" \
		jenca-cloud/jenca-router:$(VERSION)-dev test.js