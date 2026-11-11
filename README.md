
# RAJ Official Portfolio

A responsive React + Vite portfolio starter for **RAJ — MD JARAEJ ALAM**.

## Requirements
- Node.js 18 or newer
- npm

## Run locally
1. Extract the ZIP.
2. Open the extracted `raj-portfolio` folder in VS Code.
3. Open Terminal in VS Code.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local URL shown by Vite (usually `http://localhost:5173`).

## Build for publishing
```bash
npm run build
npm run preview
```

The production website is generated in the `dist` folder.

## Personalize before publishing
Open `src/data.js` and:
- Add your real social profile URLs in `socials`.
- Add your public contact email in `profile.email`.
- Add a real CV PDF URL in `profile.resumeUrl` if you want one.
- Add apps to `apps`, websites to `websites`, and projects to `projects`.
- Update the skills list so it reflects only skills you are comfortable claiming.
- Add real screenshots and store URLs when they are available.

The NOVA AI Call Assistant entry is marked **In development**. It does not claim a Play Store release or unverified features.

## Important
- The contact form uses the visitor's default email app (`mailto:`); it is not a server-backed form.
- Social links are intentionally blank until you provide the correct public URLs.
- This starter does not include a private admin dashboard or database. Project entries are edited in `src/data.js`.
- Replace the Google Fonts import with locally hosted fonts if you prefer not to use an external font service.
- Review all content, privacy details and links before publishing publicly.
