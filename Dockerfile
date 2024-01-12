FROM continuumio/miniconda3:23.3.1-0-alpine
USER root

# Download and install updated nodejs
ENV NODE_PACKAGE_URL  https://unofficial-builds.nodejs.org/download/release/v18.16.0/node-v18.16.0-linux-x64-musl.tar.gz
RUN apk add libstdc++
WORKDIR /opt
RUN wget $NODE_PACKAGE_URL
RUN mkdir -p /opt/nodejs
RUN tar -zxvf *.tar.gz --directory /opt/nodejs --strip-components=1
RUN rm *.tar.gz
RUN ln -s /opt/nodejs/bin/node /usr/local/bin/node
RUN ln -s /opt/nodejs/bin/npm /usr/local/bin/npm
RUN npm install -g npm@9.6.6

# Install necessary packages
RUN apk add --update nano git python3 py3-pip g++ wget && rm -rf /var/cache/apk/*
RUN mkdir -p /usr/local/lib/node_modules

RUN adduser -D -g 'OpenIAP user' -h /home/openiap openiapuser
RUN mkdir -p /home/openiap/.openiap/packages
# RUN chown -R openiapuser:root /home/openiap && chmod -R g+rwX /home/openiap
# RUN chown -R openiapuser:root /usr/local/lib/node_modules && chmod -R g+rwX /usr/local/lib/node_modules
RUN chown -R openiapuser:root /home/openiap && chmod -R 775 /home/openiap
RUN chown -R openiapuser:root /usr/local/lib/node_modules && chmod -R 775 /usr/local/lib/node_modules

USER openiapuser
WORKDIR /home/openiap

# Copy files with appropriate permissions
COPY --chown=openiapuser:root package.json /home/openiap/package.json
COPY --chown=openiapuser:root package-lock.json /home/openiap/package-lock.json
COPY --chown=openiapuser:root bin /home/openiap/bin

RUN npm install

# OpenShift hack
COPY --chown=openiapuser:root package.json /.npm/package.json
RUN chmod 777 /.npm
RUN rm -r /.npm/*

COPY --chown=openiapuser:root dist /home/openiap/dist

CMD ["node", "--require", "./dist/Logger.js", "dist/runagent.js"]




# # FROM node:lts-alpine
# # from python:alpine3.17
# # FROM alpine:3.17
# # FROM mambaorg/micromamba:1.5.1-alpine
# FROM continuumio/miniconda3:23.3.1-0-alpine
# USER root
# RUN apk add --update nano git nodejs npm python3 py3-pip g++ wget && rm -rf /var/cache/apk/*
# # Fix node-red scan error
# RUN mkdir -p /usr/local/lib/node_modules

# RUN addgroup -S openiapgroup
# RUN adduser -S -G openiapgroup -h /home/openiap openiapuser
# RUN chown -R openiapuser:openiapgroup /home/openiap
# USER openiapuser

# WORKDIR /home/openiap
# COPY --chown=openiapuser:openiapgroup package.json /home/openiap/package.json
# COPY --chown=openiapuser:openiapgroup package-lock.json /home/openiap/package-lock.json
# COPY --chown=openiapuser:openiapgroup bin /home/openiap/bin

# RUN npm install

# # openshift hack
# COPY --chown=openiapuser:openiapgroup package.json /.npm/package.json
# RUN chmod 777 /.npm
# RUN rm -r /.npm/*

# COPY --chown=openiapuser:openiapgroup dist /home/openiap/dist
# # RUN npx -y @openiap/nodeagent -noop
# # CMD ["npx", "-y", "@openiap/nodeagent", "-service"]
# CMD ["node", "--require", "./dist/Logger.js", "dist/runagent.js"]
