# FROM node:lts-alpine
# from python:alpine3.17
FROM alpine:3.17
RUN apk add --update git nodejs npm python3 py3-pip g++ && rm -rf /var/cache/apk/*
# COPY dist /tmp/dist
COPY . /tmp
WORKDIR /tmp
# RUN python -m pip install --upgrade pip
# RUN python -m pip install openiap
# load current version
# RUN npx -y @openiap/nodeagent -noop
CMD ["npx", "-y", "@openiap/nodeagent", "-service"]
# CMD ["node", "dist/agent.js"]
