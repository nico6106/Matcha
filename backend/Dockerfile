FROM node:18-alpine

# TODO change to production before deployment
ENV NODE_ENV=development

RUN mkdir -p /backend
WORKDIR /backend

EXPOSE 3333

COPY ./backend.sh /backend.sh
RUN apk update && apk add postgresql-client
RUN chmod 755 /backend.sh
ENTRYPOINT ["/backend.sh"]