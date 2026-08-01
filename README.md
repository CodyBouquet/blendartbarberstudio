# blendART Barber Studio — website

Static site (no build step): `index.html` + `styles.css` + `script.js` + self-hosted fonts in `fonts/`.
Deploy by uploading the whole folder to any static host.

## Hooking up Google scheduling

All booking config lives at the top of `script.js` in the `BOOKING` object.

1. In Google Calendar, open (or create) an **appointment schedule** — one for the
   studio and/or one per artist.
2. Click **Share** on the schedule and copy the booking-page link
   (`https://calendar.google.com/calendar/appointments/schedules/...`).
3. Paste it into the matching `google: ""` field in `script.js`.

Anyone with a `google` link gets their calendar **embedded right on the page**
(the site appends `?gv=true` automatically). Artists without one fall back to
their current external booking link (`url`) — Fresha for Marlowe/Dominic/Mo,
theCut for Ashley, Booksy for Christina — so the site works today and upgrades
artist-by-artist as Google links are added.

## Content the shop should confirm before launch

- **Prices** in the Services section are typical placeholders (only "haircut ~$25"
  was verifiable from public listings) — confirm each with the shop.
- Artist roles ("owner / master barber" etc.) — confirm titles.
- Hours match the current site (Tue 10–7, Wed 10:30–5, Thu/Fri 10–7, Sat 10–5).

## Local preview

```
python -m http.server 8735 -d .
```
Then open http://localhost:8735
