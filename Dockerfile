# FROM node:lts-alpine
from alpine:3.17
RUN apk add --update git nodejs npm python3 py3-pip && rm -rf /var/cache/apk/*
COPY dist /tmp/dist
RUN pip install openiap
RUN npx -y @openiap/nodeagent -noop
CMD ["npx", "@openiap/nodeagent", "-service"]
