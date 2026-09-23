# CCLO

A React + Vite wellness directory and personal collection app.

## Run

```sh
npm install
npm run dev
```

Open the URL printed by Vite (normally http://localhost:3000).

## Available features

- Clickable explore map and directory links, with browser back/forward navigation.
- Profile, saved membership interests, and vault items stored in this browser.
- Search/filter sample memberships and open location searches in Google Maps.
- Add books and fragrances manually or from a photo; edit, delete, rate, track status, and mark items available to let.
- Search the vault, preview a collection slideshow, and export/import JSON backups.
- Keyboard accessible dialogs and controls, with responsive layouts.

Memberships are clearly labeled sample data. Saving interest does not make a booking or payment. There is no server account, partner matching, payment processor, or cross-device synchronization.

## Optional AI (local development)

Without a key, manual entry and all local features work. To enable the existing Gemini integration, add `GEMINI_API_KEY` to `.env.local`, then restart Vite. Live search and photo recognition depend on the API account and model availability. Errors fall back to useful local actions.

The current Vite integration places this key in the browser bundle. Use it only for local development. A deployed application must move AI requests and credentials behind an authenticated server endpoint.

## Checks

```sh
npm run lint
npm run build
```

Export your vault before clearing browser data. Images are resized before storage; the app reports when browser storage is unavailable or full.

Browser interaction checks (Microsoft Edge installed): run npm test. Tests cover navigation, persistent profile and memberships, vault editing and backup round-trips, and mobile photo entry.
