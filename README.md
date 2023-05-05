# ZapPlanner

Periodic lightning payments powered by Nostr Wallet Connect (NWC)

Try it here: https://zapplanner.albylabs.com/

## Programmatically filling the fields

As a service you can programmatically create a URL with all the subscription properties that your users will only need to confirm:

```
https://zapplanner.albylabs.com/confirm?amount=21&recipient=hello@getalby.com&timeframe=30d&comment=baz&payerdata=%7B%22name%22%3A%22Bob%22%7D&returnUrl=https%3A%2F%2Fexample.com
```

- `amount`, `recipient`, `timeframe` are required
- `amount` is in sats
- `recipient` must be a lightning address
- `timeframe` must be in milliseconds, or a valid [ms](https://www.npmjs.com/package/ms) string e.g. `1d`, `30%20minutes`
- `payerdata` should be a URL-encoded JSON object as per [LUD-18](https://github.com/lnurl/luds/blob/luds/18.md)
- `comment` and `payerdata` will only be sent if the recipient lightning address supports it
- `returnUrl` encoded URL to show as link on confirmation page

## Installation

Run `$ yarn install`

Run `$ cp .env.example .env && husky install`

Run `$ yarn cloak:generate` and set `PRISMA_FIELD_ENCRYPTION_KEY=<CLOAK_MASTER_KEY>` in `.env`

Unless you already have it, create the database with: `$ createdb boostagram-viewer`

Make sure to set your Postgres username and password in `.env`. To list Postgres users, open `$ psql` followed by `> \du`. To set no password, leave it empty like this: `postgres://username:@localhost...`.

Run `$ yarn db:migrate:deploy` (if developing with Docker make sure to run Run `$ yarn docker:start` first)

## Development (Docker)

Run `$ yarn docker:start`

Run `$ yarn inngest:local`

Run `$ yarn dev`

## Development (local)

Run `$ yarn inngest:local`

Run `$ yarn dev`

## NextJS

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Inngest

ZapPlanner is a serverless application that uses [Inngest](https://www.inngest.com/) to power its background jobs.
