## Introduction

The following repository contains a practical example of making use of [Ephemeral Proxies API](https://rapidapi.com/rpi4gx/api/ephemeral-proxies) to concurrently hit a website from many different proxies.

## Installation
1. Pull repository
```
git clone git@github.com:rpi4gx/ephemeral-proxies-concurrency-example.git
```
2. Install modules
```
$ npm install
```

## Running

Example: 
```
$ npx ts-node src/main.ts \
  --x-rapidapi-key MY_RAPIDAPI_KEY \
  --number-of-proxies 200 \
  --target https://www.mywebsite.com

Collecting 200 proxies ...
Hiting https://www.mywebsite.com using 200 proxies with 200 different ips from 24 different countries ...
Successfull requests against target: 198
```

## Requeriments
 * A valid RapidAPI key, you can obtain one for free on [Rapid API](https://rapidapi.com)
 * Optional: A subscription to a payment plan for [Ephemeral Proxies API](https://rapidapi.com/rpi4gx/api/ephemeral-proxies)
