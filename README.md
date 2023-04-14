# ZapPlanner

Periodic lightning payments powered by Nostr Wallet Connect (NWC)

Try it here: https://zapplanner.albylabs.com/

## Installation

Run `yarn install`

Run `cp .env.example .env.local && husky install`

Run `yarn cloak:generate` and set `PRISMA_FIELD_ENCRYPTION_KEY=<CLOAK_MASTER_KEY>` in .env.local

## Development

Run `yarn docker:start`

Run `yarn inngest:local`

Run `yarn dev`

## NextJS

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Inngest

ZapPlanner is a serverless application that uses [Inngest](https://www.inngest.com/) to power its background jobs.
