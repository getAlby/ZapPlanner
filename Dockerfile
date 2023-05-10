# Install dependencies only when needed
FROM node:18-alpine AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile

# If using npm with a `package-lock.json` comment out above and use below instead
# RUN npm ci

ENV NEXT_TELEMETRY_DISABLED 1

# Add `ARG` instructions below if you need `NEXT_PUBLIC_` variables
# then put the value on your fly.toml
# Example:
# ARG NEXT_PUBLIC_EXAMPLE="value here"

#RUN yarn build

RUN --mount=type=secret,id=DATABASE_URL \
    --mount=type=secret,id=PRISMA_FIELD_ENCRYPTION_KEY \
    DATABASE_URL="$(cat /run/secrets/DATABASE_URL)" \
    PRISMA_FIELD_ENCRYPTION_KEY="$(cat /run/secrets/PRISMA_FIELD_ENCRYPTION_KEY)" yarn db:migrate:deploy

# Add `ARG` instructions below if you need `NEXT_PUBLIC_` variables

RUN --mount=type=secret,id=DATABASE_URL \
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    --mount=type=secret,id=PRISMA_FIELD_ENCRYPTION_KEY \
    DATABASE_URL="$(cat /run/secrets/DATABASE_URL)" \
    SENTRY_AUTH_TOKEN="$(cat /run/secrets/SENTRY_AUTH_TOKEN)" \
    PRISMA_FIELD_ENCRYPTION_KEY="$(cat /run/secrets/PRISMA_FIELD_ENCRYPTION_KEY)" yarn build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# fix NextJS 13 cache errors
COPY --chown=nextjs:nodejs --from=builder /app/ ./
#COPY --from=builder /app ./

USER nextjs

CMD ["yarn", "start"]

# If using npm comment out above and use below instead
# CMD ["npm", "run", "start"]
