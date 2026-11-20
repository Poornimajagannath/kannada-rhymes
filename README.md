# Samaya’s Kannada Rhymes

A phone page for one Kannada rhyme a week. Amma and Samaya hear it, fill the blank, play with the sounds, and tell the story. The labels are English. The song is only the verified lines, written in English letters.

Open it at [https://poornimajagannath.github.io/kannada-rhymes/](https://poornimajagannath.github.io/kannada-rhymes/) after it is published from `main`.

## The four pages

- **Week** — this week’s picture, the Hear / Fill / Play / Lead steps, and Amma’s recording. **See whole rhyme** lists every line.
- **Sing** — two lines at a time. Amma’s line, then Samaya’s, with a glowing blank. Tap the blank when you want to show the word. Any try counts. **See whole rhyme** is here too, when you need the rest of the song.
- **Words** — clap the chunks of a word, then notice the rhyme twins. It is noticing, not a quiz.
- **Story** — the picture, the steps in order, and one line for Samaya to say.

The bottom bar switches pages. **All 6** opens every rhyme. The rhyme you pick, and the week step you tap, stay on this phone.

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
