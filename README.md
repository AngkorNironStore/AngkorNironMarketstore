# Remote Sound Panel

A small fake 404 page with a hidden host panel that can send sound events to connected visitors.

## Run Locally

```powershell
npm start
```

Visitor page:

```text
http://localhost:3000/
```

Host page:

```text
http://localhost:3000/#host
```

Host password:

```text
bluehost
```

Visitors may need to click the fake reload button once before their browser allows sound.

## Deploy

GitHub Pages cannot run `server.js`, so the live sound feature needs a Node host such as Render, Railway, Fly.io, or a VPS.

For a Node host, use:

```text
npm start
```

The app uses the `PORT` environment variable automatically when the host provides one.
