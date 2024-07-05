---
title: Getting started with Rammerhead
description: Basic information on setting up Rammerhead
sidebar:
    order: 1
---

# Rammerhead

> Proxy based on testcafe-hammerhead (password is `sharkie4life`)

[**GitHub**](https://github.com/binary-person/rammerhead)

Demo link: https://demo-opensource.rammerhead.org

Polished closed-source-for-now browser version: https://browser.rammerhead.org

## Contributions

Server infrastructure costs money and developing this project consumes a lot of my time, so I would appreciate it greatly if you become a Patreon member: https://www.patreon.com/rammerhead

## Features

This proxy supports proxying basically everything except Google logins and a few other notable exceptions such as Netflix, etc.
The proxy allows users to create a "session". When they access their session, their `localStorage` and `cookies` will be synced with Rammerhead. This allows for accurately mocking cookied requests and conveniently save their logins even if they switch devices. This also enables users to configure a custom HTTP proxy server for Rammerhead to connect to for the session.

## Installation

Rammerhead recommends you to have at least `Node.js v16` to be installed.

```
git clone https://github.com/binary-person/rammerhead
cd rammerhead
npm install
npm run build

node src/server.js # start the server
```

## Configuration

Configure your settings in src/config.js. If you wish to consistently pull updates from this repo without the hassle of merging, create `config.js` in the root folder so they override the configs in `src/`.

## Discord

For any user-help non-issue related questions, especially pertaining to Rammerhead Browser, please ask them here: [Rammerhead Support Server](https://discord.gg/VNT4E7gN5Y).
