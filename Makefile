.PHONY: images test

VERSION = 1.0.0

# build the docker images - the dev version includes development node modules
images:
	docker build -t jenca-cloud/jenca-router:$(VERSION) .
	echo "FROM jenca-cloud/jenca-router:$(VERSION)\nRUN npm install" > Dockerfile.dev
	docker build -f Dockerfile.dev -t jenca-cloud/jenca-router:$(VERSION)-dev .
	rm Dockerfile.dev

test:
	docker run -ti --rm \
		--entrypoint "node" \
		jenca-cloud/jenca-router:$(VERSION)-dev test.js