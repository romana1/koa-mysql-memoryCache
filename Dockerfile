FROM node:latest as build

### install dependencies


COPY package.json .
COPY app app
COPY config config
COPY spec spec


# build
RUN npm install modclean -g
RUN npm install
RUN modclean -r

FROM node:alpine
RUN mkdir /var/www
WORKDIR "/var/www"
COPY --from=build app app
COPY --from=build config config
COPY --from=build spec spec
COPY --from=build node_modules node_modules
COPY --from=build package.json package.json

EXPOSE 8081
CMD DEBUG=* node --harmony ./node_modules/jasmine/bin/jasmine
