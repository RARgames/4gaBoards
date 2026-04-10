FROM node:24-alpine AS base

RUN npm install npm@latest --global
RUN npm install pnpm@latest --global

FROM base AS packages-build

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages ./packages
RUN pnpm install --frozen-lockfile --filter @4gaboards/*...
RUN pnpm packages:build

FROM base AS server-dependencies

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY server/package.json server/package.json
COPY --from=packages-build /app/packages ./packages
RUN pnpm deploy --filter server --prod --config.inject-workspace-packages=true output

FROM base AS client

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY client/package.json client/package.json
COPY --from=packages-build /app/packages ./packages
RUN pnpm install --frozen-lockfile --filter client... --prod

COPY client ./client
RUN DISABLE_ESLINT_PLUGIN=true pnpm client:build

FROM node:24-alpine

RUN apk -U upgrade
RUN apk add bash --no-cache

USER node
WORKDIR /app

COPY --chown=node:node --chmod=775 start.sh .
COPY --chown=node:node server .

RUN mv .env.sample .env

COPY --from=server-dependencies --chown=node:node /app/output/node_modules node_modules

COPY --from=client --chown=node:node /app/client/build public
COPY --from=client --chown=node:node /app/client/build/index.html views/index.ejs

VOLUME /app/public/user-avatars
VOLUME /app/public/project-background-images
VOLUME /app/private/attachments

HEALTHCHECK --interval=1s --timeout=5s --start-period=8s --retries=50 CMD wget -q --spider http://localhost:1337 || exit 1
EXPOSE 1337
CMD ["./start.sh"]
