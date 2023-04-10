# FROM node:lts-alpine
# from python:alpine3.17
from alpine:3.17
RUN apk add --update git nodejs npm python3 py3-pip g++ && rm -rf /var/cache/apk/*
COPY dist /tmp/dist
RUN python -m pip install --upgrade pip
RUN python -m pip install openiap
# load current version
# RUN npx -y @openiap/nodeagent -noop
CMD ["npx", "-y", "openiap/nodeagent", "-service"]
