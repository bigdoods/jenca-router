.PHONY: images test

VERSION = 1.1.0
SERVICE = jenca-router
HUBACCOUNT = jenca

ROOT_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

# build the docker images
# the dev version includes development node modules
images:
	docker build -t $(HUBACCOUNT)/$(SERVICE):latest .
	docker rmi $(HUBACCOUNT)/$(SERVICE):$(VERSION) || true
	docker tag $(HUBACCOUNT)/$(SERVICE):latest $(HUBACCOUNT)/$(SERVICE):$(VERSION)

test:
	@echo "nginx router"
