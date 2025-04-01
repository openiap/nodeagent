.PHONY: build

VERSION = 0.0.115
BUILD = 2
HASH = $(shell git rev-parse --short HEAD)
bump:
	# @echo "Bumping version to $(VERSION) recursively..."
	# @find . -name "package.json" -exec sed -i 's/"version": "[0-9]\+\.[0-9]\+\.[0-9]\+"/"version": "$(VERSION)"/' {} \;
	@echo "Bumping version to $(VERSION)"
	@sed -i 's/"version": "[0-9]\+\.[0-9]\+\.[0-9]\+"/"version": "$(VERSION)"/' package.json	
build:
	@npm run build
compose:
	@sed -i 's/"version": "[0-9]\+\.[0-9]\+\.[0-9]\+"/"version": "$(VERSION)"/' package.json
	@docker buildx build --no-cache -t openiap/nodeagent:edge -t openiap/nodeagent:$(VERSION)-$(BUILD) --platform linux/amd64 --push .
	@echo "pushed openiap/nodeagent:$(VERSION)-$(BUILD)"
latest:
	@sed -i 's/"version": "[0-9]\+\.[0-9]\+\.[0-9]\+"/"version": "$(VERSION)"/' package.json
	@docker buildx build --no-cache -t openiap/nodeagent:edge -t openiap/nodeagent:latest -t openiap/nodeagent:$(VERSION) -t openiap/nodeagent:$(VERSION)-$(BUILD) --platform linux/amd64,linux/arm64 --push .
	@docker buildx build --no-cache -t openiap/dotnetagent:edge -t openiap/dotnetagent:latest -t openiap/dotnetagent:$(VERSION) -t openiap/dotnetagent:$(VERSION)-$(BUILD) --platform linux/amd64,linux/arm64 --push -f Dockerfiledotnet .
	@docker buildx build --no-cache -t openiap/nodechromiumagent:edge -t openiap/nodechromiumagent:latest -t openiap/nodechromiumagent:$(VERSION) -t openiap/nodechromiumagent:$(VERSION)-$(BUILD) --platform linux/amd64,linux/arm64 --push -f Dockerfilechromium .
	@echo "pushed openiap/nodeagent:$(VERSION)-$(BUILD)"
	@echo "pushed openiap/dotnetagent:$(VERSION)-$(BUILD)"
	@echo "pushed openiap/nodechromiumagent:$(VERSION)-$(BUILD)"