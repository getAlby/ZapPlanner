# ZapPlanner

Scheduled recurring lightning payments powered by Nostr Wallet Connect (NWC)

Try it here: https://zapplanner.albylabs.com/

## Programmatically filling the fields

As a service you can programmatically create a URL with all the subscription properties that your users will only need to confirm:

```
https://zapplanner.albylabs.com/confirm?amount=21&recipient=hello@getalby.com&timeframe=30d&comment=baz&payerdata=%7B%22name%22%3A%22Bob%22%7D&returnUrl=https%3A%2F%2Fexample.com
```

- `amount`, `recipient`, (`timeframe`|`cron`) are required
- `amount` is in sats
- `recipient` must be a lightning address
- `timeframe` must be in milliseconds, or a valid [ms](https://www.npmjs.com/package/ms) string e.g. `1d`, `30%20minutes`
- `cron` [cron expression](https://crontab.guru/) e.g. `0 10 * * 0`, `0 12 15 * *`
- `payerdata` should be a URL-encoded JSON object as per [LUD-18](https://github.com/lnurl/luds/blob/luds/18.md)
- `comment` and `payerdata` will only be sent if the recipient lightning address supports it
- `returnUrl` encoded URL to show as link on confirmation page
- `nwcUrl` a url-encoded NWC connection secret

## API

The API can be called to seamlessly setup subscriptions from other services / websites without having to visit ZapPlanner.com. The API is currently undocumented.

## Installation

Run `$ yarn install`

Run `$ cp .env.example .env.local && husky install`

_note: if .env.local does not work for you, as a temporary solution try renaming it to .env_

Run `$ yarn cloak:generate` and set `PRISMA_FIELD_ENCRYPTION_KEY=<CLOAK_MASTER_KEY>` in `.env.local`

### Database Setup (Docker)

Run `$ yarn docker:start`

Run `$ yarn db:migrate:deploy`

### Database Setup (Non-Docker)

Unless you already have it, create the database with: `$ createdb boostagram-viewer`

Make sure to set your Postgres username and password in `.env.local`. To list Postgres users, open `$ psql` followed by `> \du`. To set no password, leave it empty like this: `postgres://username:@localhost...`.

Run `$ yarn db:migrate:deploy`

## Development (Docker)

Run `$ yarn docker:start`

Run `$ yarn inngest:local`

Run `$ yarn dev`

## Development (Non-Docker)

Run `$ yarn inngest:local`

Run `$ yarn dev`

## NextJS

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Inngest

ZapPlanner is a serverless application that uses [Inngest](https://www.inngest.com/) to power its background jobs.

## Alby Labs Project

ZapPlanner is a hackday / Alby Labs project to show how lightning subscriptions can be possible through the power of NWC. To be taken further the architecture needs to be re-thought so that it is more reliable and more scalable.

- NextJS as a serverless platform is not the right tool (and because of this requires inngest, which we also kind of abuse the purpose of inngest)
- It doesn't really make sense that each subscription itself is responsible for re-scheduling payments for itself

There are two main use cases we see for subscription payments:

- Setting up a recurring payment yourself - however, the UI/UX of this might be better directly integrated into the wallet (e.g. Alby Hub)
- Setting up a subscription on a third party platform for some sort of service (e.g. a monthly movies platform subscription or internet / mobile plan). Similar to subscriptions powered by Paypal or Stripe, but using an NWC connection instead of a credit card, ZapPlanner would power the subscription payments behind the scenes. The UX is quite nice with the NWC 1-click connection flow - the user could simply connect their wallet (e.g. with [Bitcoin Connect](https://github.com/getAlby/bitcoin-connect)) and then confirm the subscription, without visiting ZapPlanner (the platform/site would just use the ZapPlanner API directly).

One limitation of setting up these "Push" subscriptions from ZapPlanner is it's harder for the service to be able to do flexible charging. Therefore, it might be better for the service to have access to the NWC connection secret instead, so it always has control of how much it can charge (within the connection budgets set by the user).
