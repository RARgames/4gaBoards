FROM node:20-alpine as server-dependencies

WORKDIR /app

COPY server/package.json server/package-lock.json ./

RUN npm install npm@latest --global
RUN npm install pnpm --global
RUN pnpm import
RUN pnpm install --prod

FROM node:20-alpine AS client

WORKDIR /app

COPY client/package.json client/package-lock.json ./

RUN npm install npm@latest --global
RUN npm install pnpm --global
RUN pnpm import
RUN pnpm install --prod

COPY client .
RUN DISABLE_ESLINT_PLUGIN=true npm run build

FROM node:20-alpine

RUN apk -U upgrade
RUN apk add bash --no-cache

USER node
WORKDIR /app

COPY --chown=node:node --chmod=775 start.sh .
COPY --chown=node:node server .

RUN mv .env.sample .env

COPY --from=server-dependencies --chown=node:node /app/node_modules node_modules

COPY --from=client --chown=node:node /app/build public
COPY --from=client --chown=node:node /app/build/index.html views/index.ejs

VOLUME /app/public/user-avatars
VOLUME /app/public/project-background-images
VOLUME /app/private/attachments

EXPOSE 1337

CMD ["./start.sh"]
