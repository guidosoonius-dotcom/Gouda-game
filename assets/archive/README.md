# Archive photographs

Originals of the licensed photographs of the game (see `src/data/archive.ts` for rights and credits).
They are not committed: `npm run archive` downloads them from Wikimedia Commons into this folder and
writes the game's webp files (960 px, under 250 KB) to `public/img/archive/`. It also writes
`src/data/archive-files.json`: the game shows a photograph only when its file is listed there, so
commit that file together with the webp files.

If Commons is rate-limiting you, save the original by hand (the file page links to it, "Original file")
as `assets/archive/<name>.jpg` and run `npm run archive` again:

| name | Commons file |
|---|---|
| stadhuis-trap | File:De trap van het raadhuis of stadhuis op de Markt te Gouda, Nederland september 1940, SFA004001294.jpg |
| stadhuis-werkkamer | File:De werkkamer van de burgemeester op het stadhuis, Markt te Gouda, Nederland 1940, SFA004001297.jpg |
| sint-jan-glazen | File:Uitneming glazen - Gouda - 20326661 - RCE.jpg |
| synagoge-turfmarkt | File:Turfmarkt Gouda met voormalige synagoge.jpg |
| synagoge-plaquette | File:Plaquette door Ralph Prins op de deur voormalige synagoge Gouda.jpg |
