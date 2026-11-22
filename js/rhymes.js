/* Verified lyrics, transliteration only.
   Lines are copied from the checked household texts.
   Do not edit a line to make it fit the screen.
   Optional audioChunks (seconds), one entry per sing-along part:
   audioChunks: [{ start: 0, end: 8.2, pauseAt: 5.1 }]
   With no audioChunks, Sing with me plays and pauses the whole recording. */
(function () {
  const t = (text) => ({ text });
  const b = (blank) => ({ blank });
  const br = () => ({ br: true });

  function line(role, mean, parts) {
    return { role, mean, parts: typeof parts === "string" ? [t(parts)] : parts };
  }

  window.RHYMES = [
    {
      id: "aane-banthondu-aane",
      short: "Aane",
      title: "Aane Banthondu Aane",
      english: "An Elephant Came",
      theme: "aane",
      image: "images/aane.jpg",
      alt: "Aane bringing coconut and jaggery",
      gesture: "Swing a trunk on every “aane”, then share and run.",
      storyNote: "Four steps in this picture",
      chunks: [
        [
          line("samaya", "An elephant has come, one elephant!", [t("Aane banthondu "), b("aane")]),
          line("amma", "Which town is this elephant from?", "Yaavooraane?"),
        ],
        [
          line("samaya", "It is the elephant from Bijapur.", [b("Bijaapuradaane")]),
          line("amma", "Why did it come here?", "Illige yaake bantu?"),
        ],
        [
          line("together", "It lost its way and arrived.", "Daari tappi bantu"),
          line("samaya", "It brought dried coconut and jaggery.", [t("Kobri bella "), b("tantu")]),
        ],
        [
          line("samaya", "It shared them with all the children.", [t("Makkaligellaa "), b("hanchtu")]),
          line("samaya", "Then the elephant ran away.", [t("Aane oodi "), b("hoytu")]),
        ],
      ],
      claps: [
        { say: "Aane", pieces: ["Aa", "ne"], mean: "elephant", aside: "Ane taps along" },
        { say: "Kobri", pieces: ["Ko", "bri"], mean: "coconut", aside: "Ane taps along" },
        { say: "Bella", pieces: ["Be", "lla"], mean: "jaggery", aside: "Ane taps along" },
        { say: "Makkalu", pieces: ["Mak", "ka", "lu"], mean: "children", aside: "Ane taps along" },
      ],
      defaultClap: 3,
      families: [
        {
          words: [
            { w: "Bantu", mean: "came" },
            { w: "Tantu", mean: "brought" },
            { w: "Hanchtu", mean: "shared" },
            { w: "Hoytu", mean: "ran away" },
          ],
        },
      ],
      steps: [
        { w: "Bantu", mean: "the elephant arrived" },
        { w: "Daari tappi", mean: "it lost its way" },
        { w: "Hanchtu", mean: "it shared kobri and bella" },
        { w: "Oodi hoytu", mean: "then it ran away" },
      ],
      speak: {
        prompt: "Yaavooraane?",
        promptMean: "Which town is this elephant from?",
        answer: "Bijaapuradaane!",
        answerMean: "the elephant from Bijapur",
      },
    },
    {
      id: "nayi-mari-nayi-mari",
      short: "Nayimari",
      title: "Nayimari Nayimari Tindi Beke",
      english: "Puppy, Puppy, Do You Want a Snack?",
      theme: "ziggy",
      image: "images/nayimari.jpg",
      alt: "Ziggy, the family’s black Lab, waiting with his snack bowl",
      gesture: "Ziggy bounces and wags on his turn",
      storyNote: "Four steps in this picture",
      chunks: [
        [
          line("amma", "Puppy, puppy, do you want a snack?", "Nayimari nayimari tindi beke?"),
          line("samaya", "I want a snack, I want a drink, I want everything!", [b("Tindi"), t(" beku"), br(), t("teertha beku ella beku")]),
        ],
        [
          line("amma", "Puppy, why do you need a snack?", "Nayimari ninage tindi eke beku?"),
          line("samaya", "So I can eat, grow strong, and guard the house.", [t("Tindu gattiyaagi maneya "), b("kaayabeku")]),
        ],
        [
          line("amma", "Puppy, if a thief comes, what will you do?", "Nayimari kaLLa bandarenu maaduve?"),
          line("samaya", "I will bark lol-lol bow and chase about!", [t("LoL loL "), b("bau"), t(" endu koogi aaduve")]),
        ],
        [
          line("amma", "Wait, clever pup — I will go and bring a snack.", "Jaanamari taaLu hogi tindi taruvenu"),
          line("samaya", "There — I will stay and keep watch over your house.", "Taa ninna maneya naanu kaayutiruvenu"),
        ],
      ],
      claps: [
        { say: "Nayimari", pieces: ["Naa", "yi", "ma", "ri"], mean: "puppy", aside: "Ziggy taps along" },
        { say: "Tindi", pieces: ["Tin", "di"], mean: "snack", aside: "Ziggy taps along" },
        { say: "Teertha", pieces: ["Teer", "tha"], mean: "drink", aside: "as you say it" },
        { say: "Mane", pieces: ["Ma", "ne"], mean: "house", aside: "Ziggy taps along" },
      ],
      defaultClap: 1,
      families: [
        {
          words: [
            { w: "Beke", mean: "do you want" },
            { w: "Beku", mean: "I want" },
          ],
        },
        {
          title: "More twins",
          note: "these sound alike too",
          words: [
            { w: "Nayimari", mean: "puppy" },
            { w: "Jaanamari", mean: "clever pup" },
          ],
        },
        {
          title: "A sound to notice",
          note: "say it with a smile",
          words: [{ w: "LoL loL bau", mean: "the brave bark", wide: true }],
        },
      ],
      steps: [
        { w: "Tindi beku", mean: "wants a snack" },
        { w: "Kaayabeku", mean: "grow strong and guard" },
        { w: "LoL loL bau", mean: "barks at a thief" },
        { w: "TaaLu", mean: "waits for tindi" },
      ],
      speak: {
        prompt: "Tindi beke?",
        promptMean: "Puppy, do you want a snack?",
        answer: "Tindi beku!",
        answerMean: "I want a snack!",
      },
    },
    {
      id: "ondu-eradu-baalele-haradu",
      short: "BaaleLe",
      title: "Ondu Eradu BaaleLe Haradu",
      english: "One, Two, Spread the Banana Leaf",
      theme: "aane",
      image: "images/baalele.jpg",
      alt: "A meal of rice, saaru, and palya on a banana leaf",
      gesture: "Spread the leaf, serve the meal, then fold it up.",
      storyNote: "Five steps in this meal",
      chunks: [
        [
          line("samaya", "One, two — spread the banana leaf.", [t("Ondu eradu baaleLe "), b("haradu")]),
          line("samaya", "Three, four — put down the rice.", [t("Mooru naalku anna "), b("haaku")]),
        ],
        [
          line("samaya", "Five, six — serve the beLe saaru (dal rasam).", [b("Aidu"), t(" aaru beLe saaru")]),
          line("together", "Seven, eight — greens (dantu) for the palya.", "EeLu entu paLyake dantu"),
        ],
        [
          line("samaya", "Nine, ten — fold up the leaf.", [t("Ombattu "), b("hattu"), t(" ele mudurettu")]),
          line("samaya", "From one to ten, that is how it went.", [t("Ondarinda "), b("hattu"), t(" heegittu")]),
        ],
        [
          line("together", "The meal-game was done.", "Ootada aatavu mugidittu"),
        ],
      ],
      claps: [
        { say: "Ondu", pieces: ["On", "du"], mean: "one" },
        { say: "Eradu", pieces: ["E", "ra", "du"], mean: "two" },
        { say: "BaaleLe", pieces: ["Baa", "le", "le"], mean: "banana leaf" },
        { say: "Anna", pieces: ["An", "na"], mean: "rice" },
        { say: "Saaru", pieces: ["Saa", "ru"], mean: "saaru" },
        { say: "Palya", pieces: ["Pal", "ya"], mean: "palya" },
        { say: "Hattu", pieces: ["Hat", "tu"], mean: "ten" },
      ],
      defaultClap: 2,
      families: [
        {
          words: [
            { w: "Mudurettu", mean: "fold the leaf" },
            { w: "Heegittu", mean: "that is how" },
            { w: "Mugidittu", mean: "was done" },
          ],
        },
        {
          title: "Number pairs",
          note: "chant them together",
          solo: true,
          words: [
            { w: "Ondu · Eradu", mean: "one · two" },
            { w: "Mooru · Naalku", mean: "three · four" },
            { w: "Aidu · Aaru", mean: "five · six" },
            { w: "EeLu · Entu", mean: "seven · eight" },
            { w: "Ombattu · Hattu", mean: "nine · ten", wide: true },
          ],
        },
      ],
      steps: [
        { w: "Haradu", mean: "spread the banana leaf" },
        { w: "Anna haaku", mean: "put down the rice" },
        { w: "BeLe saaru", mean: "pour the saaru" },
        { w: "PaLyake dantu", mean: "greens for the palya" },
        { w: "Mudurettu", mean: "fold up the leaf" },
      ],
      speak: {
        prompt: "Aidu!",
        promptMean: "Five — shout a number from the song.",
        answer: "Hattu!",
        answerMean: "Ten! Try it at a real meal.",
      },
    },
    {
      id: "karadi-bettakke-hoyithu",
      short: "Karadi",
      title: "Karadi Bettakke Hoyitu",
      english: "The Bear Went to the Hill",
      theme: "aane",
      image: "images/karadi.jpg",
      alt: "A bear feeding two cubs jackfruit and honey",
      gesture: "Stomp up the hill, peek over, then pat a full tummy.",
      storyNote: "Four steps in this picture",
      chunks: [
        [
          line("samaya", "The bear went to the hill.", [t("Karadi bettakke "), b("hoyitu")]),
          line("together", "The bear went to the hill.", "Karadi bettakke hoyitu"),
        ],
        [
          line("together", "The bear went to the hill.", "Karadi bettakke hoyitu"),
          line("together", "To have a look around.", "Nota nodalu"),
        ],
        [
          line("amma", "What did it see?", "Noditenaadu?"),
          line("amma", "What did it see?", "Noditenaadu?"),
        ],
        [
          line("samaya", "The other side of the hill.", [b("Bettada innondu bhaaga")]),
          line("together", "The other side of the hill.", "Bettada innondu bhaaga"),
        ],
        [
          line("together", "That is what the bear saw.", "Karadi noditu"),
          line("samaya", "It brought jackfruit.", [t("Halasu "), b("tanditu")]),
        ],
        [
          line("samaya", "It mixed in honey.", [t("Jenu "), b("kalasitu")]),
          line("together", "It fed its cubs.", "MarigaLige tinnisi"),
        ],
        [
          line("samaya", "Then it ate and was happily full.", [t("Taanu tindu "), b("teegitu")]),
        ],
      ],
      claps: [
        { say: "Karadi", pieces: ["Ka", "ra", "di"], mean: "bear" },
        { say: "Betta", pieces: ["Bet", "ta"], mean: "hill" },
        { say: "Halasu", pieces: ["Ha", "la", "su"], mean: "jackfruit" },
        { say: "Jenu", pieces: ["Je", "nu"], mean: "honey" },
        { say: "Marigalu", pieces: ["Ma", "ri", "ga", "lu"], mean: "cubs" },
      ],
      defaultClap: 0,
      families: [
        {
          words: [
            { w: "Hoyitu", mean: "went" },
            { w: "Noditu", mean: "saw" },
            { w: "Tanditu", mean: "brought" },
            { w: "Kalasitu", mean: "mixed" },
            { w: "Teegitu", mean: "was full" },
          ],
        },
      ],
      steps: [
        { w: "Hoyitu", mean: "the bear climbs the hill" },
        { w: "Nota nodalu", mean: "it peeks over" },
        { w: "Halasu", mean: "jackfruit and honey" },
        { w: "Teegitu", mean: "cubs first, then a full tummy" },
      ],
      speak: {
        prompt: "Noditenaadu?",
        promptMean: "What did it see?",
        answer: "Halasu!",
        answerMean: "Jackfruit!",
      },
    },
    {
      id: "chandamama-odi-baa",
      short: "Chandamama",
      title: "Chandamama Odi Baa",
      english: "Moon Uncle, Run Over Here",
      theme: "aane",
      image: "images/chandamama.jpg",
      alt: "The moon at the window, with a plate of sugar sticks",
      gesture: "Point to the sky and pat the floor on “baa”.",
      storyNote: "Four steps in this picture",
      chunks: [
        [
          line("samaya", "Moon uncle, run over here!", [t("Chandamama oodi "), b("baa")]),
          line("samaya", "Come and play with us, all brightness and charm.", [t("Chandadinda aadu "), b("baa")]),
        ],
        [
          line("together", "Come and be our playmate.", "Bandu odanaadu baa"),
          line("together", "Run on ahead, come along!", "Munde munde oodi baa"),
        ],
        [
          line("samaya", "I will bring a sugar-stick.", [t("Sakkare kaddi "), b("tartini")]),
          line("together", "If any is left, I will give you some too.", "Mikkare ninguu kodtini"),
        ],
        [
          line("samaya", "If you smile, I will smile.", [t("Nakkare naanu "), b("nagtini")]),
          line("samaya", "If you cry, I will cry too.", [t("Attare naanu "), b("aLtini")]),
        ],
        [
          line("together", "Wherever I go, you still come along.", "Ellige hodaru bartiiyaa"),
          line("together", "Yet you stay far away, over there.", "Allee dooradali irtiiyaa"),
        ],
        [
          line("together", "Slowly you grow small (as a slim crescent).", "Mellage sannage aagtiiyaa"),
          line("together", "You go behind and in front of us.", "Hinde munde hogtiiyaa"),
        ],
        [
          line("samaya", "Moon uncle, run over here!", [t("Chandamama oodi "), b("baa")]),
          line("samaya", "Come and play with us, all brightness and charm.", [t("Chandadinda aadu "), b("baa")]),
        ],
      ],
      claps: [
        { say: "Chandamama", pieces: ["Chan", "da", "maa", "ma"], mean: "moon uncle" },
        { say: "Sakkare", pieces: ["Sak", "ka", "re"], mean: "sugar" },
        { say: "Kaddi", pieces: ["Kad", "di"], mean: "stick" },
      ],
      defaultClap: 0,
      families: [
        {
          words: [
            { w: "Oodi baa", mean: "run over here" },
            { w: "Aadu baa", mean: "come and play" },
            { w: "Odanaadu baa", mean: "be our playmate", wide: true },
          ],
        },
        {
          title: "More twins",
          note: "they sound the same at the end",
          words: [
            { w: "Tartini", mean: "I will bring" },
            { w: "Kodtini", mean: "I will give" },
            { w: "Nagtini", mean: "I will smile" },
            { w: "ALtini", mean: "I will cry" },
          ],
        },
        {
          title: "And these",
          note: "they sound the same at the end",
          words: [
            { w: "Bartiiyaa", mean: "you come" },
            { w: "Irtiiyaa", mean: "you stay" },
            { w: "Aagtiiyaa", mean: "you grow" },
            { w: "Hogtiiyaa", mean: "you go" },
          ],
        },
        {
          title: "A feeling pair",
          note: "smile, or cry, together",
          words: [
            { w: "Nakkare", mean: "if you smile" },
            { w: "Attare", mean: "if you cry" },
          ],
        },
      ],
      steps: [
        { w: "Oodi baa", mean: "call the moon over" },
        { w: "Sakkare kaddi", mean: "offer a sugar-stick" },
        { w: "Nagtini", mean: "smile, or cry, together" },
        { w: "Sannage", mean: "it grows small, and stays far" },
      ],
      speak: {
        prompt: "Chandamama oodi baa",
        promptMean: "Point to the sky and call the moon.",
        answer: "Oodi baa!",
        answerMean: "Run over here!",
      },
    },
    {
      id: "tarakka-bindige",
      short: "Tarakka",
      title: "Tarakka Bindige",
      english: "Sister, Bring the Little Water-Pot",
      theme: "aane",
      image: "images/tarakka.jpg",
      alt: "A little water-pot with a flower garland and a lamp",
      gesture: "Pass a little cup on every “Taare bindigeya”.",
      storyNote: "Four steps in this picture",
      chunks: [
        [
          line("amma", "Sister, bring the little pot — I am going for water.", "Tarakka bindige naa neerige hoguve"),
          line("samaya", "Do bring the little pot.", [b("Taare"), t(" bindigeya")]),
        ],
        [
          line("samaya", "If the pot breaks, it costs only one kaasu (a tiny coin).", [t("Bindige odedare onde "), b("kaasu")]),
          line("samaya", "Do bring the little pot.", [b("Taare"), t(" bindigeya")]),
        ],
        [
          line("amma", "For water that holds the goodness of the name Govinda.", "Govinda embo gunavuLLa neerige"),
          line("samaya", "Do bring the little pot.", [b("Taare"), t(" bindigeya")]),
        ],
        [
          line("amma", "For a drink of that nectar, in every way.", "Aavaava pariyali amrutada paanake"),
          line("samaya", "Do bring the little pot.", [b("Taare"), t(" bindigeya")]),
        ],
        [
          line("amma", "I will go to Bindu Madhava’s ghat.", "Bindu Maadhavana ghattakke hoguve"),
          line("samaya", "Do bring the little pot.", [b("Taare"), t(" bindigeya")]),
        ],
        [
          line("samaya", "I will do abhisheka for Purandara Vittala.", [t("Purandara ViTThalage abhisheka "), b("maaduve")]),
          line("samaya", "Do bring the little pot.", [b("Taare"), t(" bindigeya")]),
        ],
      ],
      claps: [
        { say: "Bindige", pieces: ["Bin", "di", "ge"], mean: "little pot" },
        { say: "Neeru", pieces: ["Nee", "ru"], mean: "water" },
        { say: "Govinda", pieces: ["Go", "vin", "da"], mean: "Govinda" },
        { say: "ViTThala", pieces: ["Vi", "ttha", "la"], mean: "Vittala" },
      ],
      defaultClap: 0,
      families: [
        {
          words: [
            { w: "Hoguve", mean: "I will go" },
            { w: "Maaduve", mean: "I will do" },
          ],
        },
        {
          title: "Her line",
          note: "every other line",
          words: [{ w: "Taare bindigeya", mean: "do bring the little pot", wide: true }],
        },
      ],
      steps: [
        { w: "Bindigeya", mean: "sister, bring the pot" },
        { w: "Ghattakke", mean: "walk to the ghat" },
        { w: "Neerige", mean: "dip the water" },
        { w: "Abhisheka", mean: "pour for Vittala" },
      ],
      speak: {
        prompt: "Taare bindigeya",
        promptMean: "Do bring the little pot.",
        answer: "Taare bindigeya",
        answerMean: "Her line, every time.",
      },
    },
    {
      id: "achchachchu-belladachchu",
      short: "Achchachchu",
      title: "Achchachchu Belladachchu",
      english: "",
      theme: "aane",
      image: "images/achchachchu-belladachchu.jpg",
      alt: "A sampangi tree with black crows, and a small farmer by a paddy field",
      gesture: "Point up at the tree, then answer each Yaava.",
      storyNote: "Four steps in this picture",
      chunks: [
        [
          line("together", "Achchachchu belladachchu", [t("Achchachchu "), b("belladachchu")]),
          line("amma", "Alli nodu illi nodu", "Alli nodu illi nodu"),
        ],
        [
          line("amma", "Sampangi maradali gumpu nodu", "Sampangi maradali gumpu nodu"),
          line("samaya", "Yaava gumpu? Kaage gumpu", [t("Yaava gumpu? "), b("Kaage gumpu")]),
        ],
        [
          line("samaya", "Yaava kaage? Kappu kaage", [t("Yaava kaage? "), b("Kappu kaage")]),
          line("samaya", "Yaava kappu? Madike kappu", [t("Yaava kappu? "), b("Madike kappu")]),
        ],
        [
          line("samaya", "Yaava madike? Annada madike", [t("Yaava madike? "), b("Annada madike")]),
          line("samaya", "Yaava anna? Bhattada anna", [t("Yaava anna? "), b("Bhattada anna")]),
        ],
        [
          line("samaya", "Yaava bhatta? Holada bhatta", [t("Yaava bhatta? "), b("Holada bhatta")]),
          line("samaya", "Yaava hola? Raitana hola", [t("Yaava hola? "), b("Raitana hola")]),
        ],
        [
          line("samaya", "Yaava raita? Namma annadaata", [t("Yaava raita? "), b("Namma annadaata")]),
        ],
      ],
      claps: [
        { say: "Achchachchu", pieces: ["Ach", "cha", "chchu"], mean: "Achchachchu" },
        { say: "Sampangi", pieces: ["Sam", "pan", "gi"], mean: "Sampangi" },
        { say: "Kaage", pieces: ["Kaa", "ge"], mean: "Kaage" },
        { say: "Kappu", pieces: ["Kap", "pu"], mean: "Kappu" },
        { say: "Raita", pieces: ["Rai", "ta"], mean: "Raita" },
      ],
      defaultClap: 2,
      families: [
        {
          words: [
            { w: "Yaava gumpu?", mean: "Yaava gumpu?" },
            { w: "Kaage gumpu", mean: "Kaage gumpu" },
          ],
        },
        {
          title: "More twins",
          note: "they sound the same at the end",
          words: [
            { w: "Yaava kaage?", mean: "Yaava kaage?" },
            { w: "Kappu kaage", mean: "Kappu kaage" },
          ],
        },
        {
          title: "And these",
          note: "they sound the same at the end",
          words: [
            { w: "Yaava kappu?", mean: "Yaava kappu?" },
            { w: "Madike kappu", mean: "Madike kappu" },
            { w: "Yaava madike?", mean: "Yaava madike?" },
            { w: "Annada madike", mean: "Annada madike" },
            { w: "Yaava anna?", mean: "Yaava anna?" },
            { w: "Bhattada anna", mean: "Bhattada anna" },
            { w: "Yaava bhatta?", mean: "Yaava bhatta?" },
            { w: "Holada bhatta", mean: "Holada bhatta" },
            { w: "Yaava hola?", mean: "Yaava hola?" },
            { w: "Raitana hola", mean: "Raitana hola" },
          ],
        },
      ],
      steps: [
        { w: "Belladachchu", mean: "Belladachchu" },
        { w: "Gumpu nodu", mean: "Gumpu nodu" },
        { w: "Kappu kaage", mean: "Kappu kaage" },
        { w: "Namma annadaata", mean: "Namma annadaata" },
      ],
      speak: {
        prompt: "Yaava kaage?",
        promptMean: "Yaava kaage?",
        answer: "Kappu kaage",
        answerMean: "Kappu kaage",
      },
    },
  ];
})();
