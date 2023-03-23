# FROM node:lts-alpine
from alpine:3.17
RUN apk add --update git nodejs npm python3 py3-pip && rm -rf /var/cache/apk/*
CMD ["npx", "-y", "@openiap/nodeagent", "-service"]

# docker build -t cloudhack/nodetest .

# docker run -it --rm -e apiurl=grpc://testuser:testuser@grpc.demo.openiap.io:443 cloudhack/nodetest /bin/sh