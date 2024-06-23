# CF Gateway for s2n demo app

This is a Cloudflare Worker that acts as an api gateway for the [Speech 2 Nutrition Demo App](https://fitvoice.dgop92.me). It provides the following features:

- DDOS protection
- Rate limiting
- Hide AWS API Gateway endpoint

More about this small architecture in this other project [Gapfind Serverless](https://github.com/dgop92/gap-find-serverless)

## Setup

The app was developed with Node.js 20.10.0

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the app with `npm run dev`

Don't forget to set `.dev.vars` using the `.dev.vars.example` file as a template.