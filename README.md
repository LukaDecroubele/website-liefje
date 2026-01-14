# Birthday Website — Starter

This is a small static site to celebrate a birthday. Files created:

- `Index.html` — main landing page
- `assets/css/styles.css` — basic styles
- `assets/js/main.js` — countdown + messages logic
- `pages/messages.html` — page to leave messages (stored in `localStorage`)

To preview locally, open `Index.html` in your browser, or run a simple static server:

```bash
# Python 3
python -m http.server 8000
# then open http://localhost:8000/Index.html
```

Adding music:

- Create a folder `assets/audio/` (already created). Drop your MP3/OGG files there.
- Double-click `tools\generate_tracks.bat` (Windows) — it will generate `assets/js/tracks.js` listing your files.
- Open `Index.html` in a browser and press Play on the radio.

If you prefer not to run the generator, you can manually edit `assets/js/tracks.js` and set:

```
window.AUDIO_TRACKS = ["assets/audio/song1.mp3","assets/audio/song2.mp3"];
```

Edit the countdown date in `Index.html` (data-date on the countdown element) to match the birthday.