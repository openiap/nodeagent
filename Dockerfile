# FROM node:lts-alpine
# from python:alpine3.17
# FROM alpine:3.17
# FROM mambaorg/micromamba:1.5.1-alpine
FROM continuumio/miniconda3:23.3.1-0-alpine
USER root
RUN apk add --update nano git nodejs npm python3 py3-pip g++ wget && rm -rf /var/cache/apk/*

WORKDIR /tmp
COPY package.json /tmp/package.json
COPY package-lock.json /tmp/package-lock.json
COPY bin /tmp/bin

RUN npm install

COPY dist /tmp/dist
# COPY . /tmp
WORKDIR /tmp
# RUN python -m pip install --upgrade pip
# RUN python -m pip install openiap
# load current version
# RUN npx -y @openiap/nodeagent -noop
# CMD ["npx", "-y", "@openiap/nodeagent", "-service"]
CMD ["node", "--require", "./dist/Logger.js", "dist/runagent.js"]
