# NWC Periodic Payments

## Installation

Run `yarn install`

Run `cp .env.example .env.local && husky install`

## Development

Run `yarn inngest:local`

Run `yarn dev`

In the inngest development server create a new event:

```json
{
  "name": "zap",
  "data": {
    "lightningAddress": "hello@getalby.com",
    "amount": 1,
    "message": "nwc periodic sats",
    "nostrWalletConnectUrl": "your-nostr-wallet-connect-url-here"
  },
  "user": {}
}
```

## NextJS

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
