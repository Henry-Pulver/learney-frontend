# Install dependencies only when needed
FROM node:17-alpine
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh libc6-compat
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
WORKDIR /app
COPY package.json package-lock.json ./
RUN git config --global url."https://".insteadOf ssh:// && npm ci

# Rebuild the source code only when needed
FROM node:14-alpine
WORKDIR /app
COPY . .
COPY --from=0 /app/node_modules ./node_modules
RUN npm run build

# Production image, copy all the files and run next
FROM node:14-alpine
WORKDIR /app

RUN apk update && apk add bash

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=1 /app/next.config.js ./
COPY --from=1 /app/public ./public
COPY --from=1 --chown=nextjs:nodejs /app/.next ./.next
COPY --from=1 /app/node_modules ./node_modules
COPY --from=1 /app/package.json ./package.json

USER nextjs

EXPOSE 3000

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry.
# ENV NEXT_TELEMETRY_DISABLED 1

CMD npm run start
