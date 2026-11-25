# Samaya’s Kannada Rhymes

A phone page for one Kannada rhyme a week. Amma and Samaya hear it, fill the blank, play with the sounds, and tell the story. The labels are English. The song is only the verified lines, written in English letters.

Open it at [https://poornimajagannath.github.io/kannada-rhymes/](https://poornimajagannath.github.io/kannada-rhymes/) after it is published from `main`.

## The pages

Home is Samaya’s. Three doors: Rhymes, Mangoes, and Blocks. Hold the ring at the bottom, then hold again, for Amma.

- **This week** — the picture, Amma’s voice, and Let’s sing. More rhymes sit underneath. The rhyme you pick stays on this phone.
- **Sing with me** — two lines at a time, in English letters. Next lines walks the rest of the song. See whole rhyme lists every line.
- **All rhymes** — the seven pictures. Amma’s voice, or not yet.
- **Play with the words** and **Tell the story** — under this week’s rhyme, past the pictures. Clap the chunks, notice the twins, then say the line.
- **Mangoes** — count five things into a basket with Ane, Myna, Kapi, or Ziggy.
- **Blocks** — a quiet count. Ondu, eradu, mooru, then three and two make five.
- **Parent corner** — which clips are recorded, and what each door is for.

## Add Amma’s recording

Record the song, then drop the file into the `audio/` folder. Name it with the rhyme id. `.m4a` or `.mp3` both work.

| Rhyme | File |
| --- | --- |
| Aane Banthondu Aane | `audio/aane-banthondu-aane.m4a` |
| Nayimari Nayimari Tindi Beke | `audio/nayi-mari-nayi-mari.m4a` |
| Ondu Eradu BaaleLe Haradu | `audio/ondu-eradu-baalele-haradu.m4a` |
| Karadi Bettakke Hoyitu | `audio/karadi-bettakke-hoyithu.m4a` |
| Chandamama Odi Baa | `audio/chandamama-odi-baa.m4a` |
| Tarakka Bindige | `audio/tarakka-bindige.m4a` |
| Achchachchu Belladachchu | `audio/achchachchu-belladachchu.m4a` |

Until that file is there, the page says “Amma hasn’t recorded this one yet.” Everything else still works. Commit the file and push to `main` so the published page can play it.

On **Sing**, the recording plays the two lines on the screen and pauses at the blank, if you add times. In `js/rhymes.js`, on that rhyme:

```js
audioChunks: [
  { start: 0, end: 8.2, pauseAt: 5.1 },
]
```

One entry per part, in seconds. `pauseAt` is the blank. Leave `audioChunks` out and the button plays and pauses the whole song.

## Notes

There is no video, no analytics, and no font loaded from the network. Noto Sans is the only typeface, in `fonts/NotoSans.ttf`. The pictures stay full, at 4:3, inside their frames.
