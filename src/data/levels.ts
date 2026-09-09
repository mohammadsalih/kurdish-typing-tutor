// Kurdish (Sorani) Typing Curriculum - Professional 46-Level Granular Curriculum
// Follows strict touch-typing pedagogy: Anchor keys first, Spacebar in Level 3,
// and an Intro -> Review -> Word Practice tri-level loop for each newly introduced key pair.

export interface Milestone {
  title: string;
  message: string;
}

export interface LevelItem {
  id: number;
  targetText: string;
  exerciseText: string;
  milestone?: Milestone;
  title: string;
  subtitle: string;
  description: string;
  unitId: number;
  targetKeys: string[];
  minWpm: number;
  minAccuracy: number;
  xpReward: number;
}

export const levels: LevelItem[] = [
  // ==============================================================================================
  // UNIT 1: HOME ROW ANCHORS & HOME KEYS (ڕیزی بنەڕەتی و پەنجەکانی ئاماژە) — Levels 1 to 17
  // ==============================================================================================

  // --- ANCHOR PAIR: ف (F) & ژ (J) ---
  {
    id: 1,
    unitId: 1,
    title: "خاڵی بنەڕەتی: کلیلی ف و ژ",
    subtitle: "ف • ژ",
    description: "دەستپێکی خاڵی بنەڕەتی بە پەنجەکانی ئاماژە لەسەر دوگمەکانی F و J",
    targetKeys: ["ف", "ژ"],
    targetText: "فژفژففژژفژژففژفژففژژ",
    exerciseText: "فژفژففژژفژژففژفژففژژ",
    minWpm: 12,
    minAccuracy: 90,
    xpReward: 40,
    milestone: {
      title: "خاڵی بنەڕەتی دەستەکان (F و J)",
      message:
        "پەنجەی ئاماژەی دەستی چەپت بخەرە سەر دوگمەی F (ف) و پەنجەی ئاماژەی دەستی ڕاستت بخەرە سەر دوگمەی J (ژ). هەست بە دەرپەڕیووە فیزیکییە بچووکەکانی سەر ئەم دوو دوگمەیە بکە؛ ئەمانە خاڵی بنەڕەتی دەستەکانتن!",
    },
  },
  {
    id: 2,
    unitId: 1,
    title: "ڕاهێنانی خێرایی کلیلی ف و ژ",
    subtitle: "ف • ژ (بەردەوام)",
    description: "جێگیرکردنی پەنجەکانی ئاماژە بە لێدانی دووبارەی ف و ژ",
    targetKeys: ["ف", "ژ"],
    targetText: "ژفژفژژففژففژژفژفژژفف",
    exerciseText: "ژفژفژژففژففژژفژفژژفف",
    minWpm: 14,
    minAccuracy: 90,
    xpReward: 45,
  },
  {
    id: 3,
    unitId: 1,
    title: "ناساندنی بۆشایی (Spacebar)",
    subtitle: "ف • ژ • بۆشایی",
    description: "بەستنەوەی پەنجەی گەورە لەگەڵ دوگمەی درێژی بۆشایی",
    targetKeys: ["ف", "ژ", " "],
    targetText: "ف ژ ف ژ فف ژژ ف ژ فف ژژ ف ژ",
    exerciseText: "ف ژ ف ژ فف ژژ ف ژ فف ژژ ف ژ",
    minWpm: 15,
    minAccuracy: 90,
    xpReward: 50,
    milestone: {
      title: "پەنجەی گەورە و دوگمەی بۆشایی (Spacebar)",
      message:
        "پەنجەی گەورەی دەستت بخەرە سەر دوگمەی درێژی خوارەوە (Spacebar). هەرکاتێک بۆشایی (␣) داواکرا، بە پەنجەی گەورەت لێی بدە و پەنجەکانی تر لەسەر شوێنی بنەڕەتی خۆیان ڕابگرە.",
    },
  },
  {
    id: 4,
    unitId: 1,
    title: "پێداچوونەوەی ف و ژ بە بۆشایی",
    subtitle: "ف • ژ • پێداچوونەوە",
    description: "تێکەڵکردنی هاوسەنگی ف و ژ لەگەڵ نێوانپڕکەری بۆشایی",
    targetKeys: ["ف", "ژ", " "],
    targetText: "ژ ف ژ ف ژژ فف ژ ف ژ ژ ف ف ژ",
    exerciseText: "ژ ف ژ ف ژژ فف ژ ف ژ ژ ف ف ژ",
    minWpm: 16,
    minAccuracy: 92,
    xpReward: 50,
  },
  {
    id: 5,
    unitId: 1,
    title: "ڕاهێنانی کورتە بڕگە بە ف و ژ",
    subtitle: "بڕگەی بنەڕەتی",
    description: "دروستکردنی بڕگە و ڕیتمی دەست تەنها بە ف و ژ و بۆشایی",
    targetKeys: ["ف", "ژ", " "],
    targetText: "فژ ژف فژ ژف ژ ف فژ ژ ف ژف فژ ژ ف",
    exerciseText: "فژ ژف فژ ژف ژ ف فژ ژ ف ژف فژ ژ ف",
    minWpm: 18,
    minAccuracy: 92,
    xpReward: 55,
  },

  // --- PAIR 1: د (D) & ک (K) ---
  {
    id: 6,
    unitId: 1,
    title: "ناساندنی کلیلی د و ک",
    subtitle: "د • ک",
    description: "پەنجەی ناوەڕاستی چەپ (D) و پەنجەی ناوەڕاستی ڕاست (K)",
    targetKeys: ["د", "ک"],
    targetText: "د ک د ک دد کک د ک ک د دد کک",
    exerciseText: "د ک د ک دد کک د ک ک د دد کک",
    minWpm: 16,
    minAccuracy: 90,
    xpReward: 55,
    milestone: {
      title: "پەنجەکانی ناوەڕاست (د و ک)",
      message:
        "پەنجەی ناوەڕاستی دەستی چەپت بەکاربهێنە بۆ کلیلی د (دوگمەی D)، و پەنجەی ناوەڕاستی دەستی ڕاستت بۆ کلیلی ک (دوگمەی K).",
    },
  },
  {
    id: 7,
    unitId: 1,
    title: "پێداچوونەوەی د و ک لەگەڵ ف و ژ",
    subtitle: "د • ک • پێداچوونەوە",
    description: "تێکەڵکردنی پیتەکانی د و ک لەگەڵ خاڵی بنەڕەتی",
    targetKeys: ["د", "ک", "ف", "ژ", " "],
    targetText: "ف د ژ ک فد ژک د ف ک ژ فد ژک دک",
    exerciseText: "ف د ژ ک فد ژک د ف ک ژ فد ژک دک",
    minWpm: 18,
    minAccuracy: 90,
    xpReward: 60,
  },
  {
    id: 8,
    unitId: 1,
    title: "ڕاهێنانی وشە بە د، ک، ف، ژ",
    subtitle: "وشەسازی ١",
    description: "نووسینی کورتە وشە تەنها بە پیتە کراوەکانی د، ک، ف، ژ",
    targetKeys: ["ف", "ژ", "د", "ک", " "],
    targetText: "دژ کف دک کژ دژ فدک دک کژ کف دژ",
    exerciseText: "دژ کف دک کژ دژ فدک دک کژ کف دژ",
    minWpm: 20,
    minAccuracy: 92,
    xpReward: 65,
  },

  // --- PAIR 2: س (S) & ل (L) ---
  {
    id: 9,
    unitId: 1,
    title: "ناساندنی کلیلی س و ل",
    subtitle: "س • ل",
    description: "پەنجەی ئەڵقەی چەپ (S) و پەنجەی ئەڵقەی ڕاست (L)",
    targetKeys: ["س", "ل"],
    targetText: "س ل س ل سس لل س ل ل س سس لل",
    exerciseText: "س ل س ل سس لل س ل ل س سس لل",
    minWpm: 18,
    minAccuracy: 90,
    xpReward: 60,
    milestone: {
      title: "پەنجەکانی ئەڵقە (س و ل)",
      message:
        "پەنجەی ئەڵقەی دەستی چەپت بەکاربهێنە بۆ کلیلی س (دوگمەی S)، و پەنجەی ئەڵقەی دەستی ڕاستت بۆ کلیلی ل (دوگمەی L).",
    },
  },
  {
    id: 10,
    unitId: 1,
    title: "پێداچوونەوەی س و ل لەگەڵ پیتەکانی پێشوو",
    subtitle: "س • ل • پێداچوونەوە",
    description: "تێکەڵکردنی س و ل لەگەڵ د، ک، ف، ژ",
    targetKeys: ["س", "ل", "د", "ک", "ف", "ژ", " "],
    targetText: "س د ل ک ف س ژ ل سد کل فژ سل",
    exerciseText: "س د ل ک ف س ژ ل سد کل فژ سل",
    minWpm: 20,
    minAccuracy: 90,
    xpReward: 65,
  },
  {
    id: 11,
    unitId: 1,
    title: "ڕاهێنانی وشە بە س، ل، د، ک، ف، ژ",
    subtitle: "وشەسازی ٢",
    description: "دروستکردنی وشەی تەواو تەنها بە پیتە کراوەکان",
    targetKeys: ["س", "ل", "د", "ک", "ف", "ژ", " "],
    targetText: "دلس کلس کس سل لک کل دژ سف کس سل کل",
    exerciseText: "دلس کلس کس سل لک کل دژ سف کس سل کل",
    minWpm: 22,
    minAccuracy: 92,
    xpReward: 70,
  },

  // --- PAIR 3: ا (A) & گ (G) ---
  {
    id: 12,
    unitId: 1,
    title: "ناساندنی کلیلی ا و گ",
    subtitle: "ا • گ",
    description: "پەنجەی تووتەی چەپ بۆ ئەلف (A) و کشانی ئاماژە بۆ گاف (G)",
    targetKeys: ["ا", "گ"],
    targetText: "ا گ ا گ اا گگ ا گ گ ا اا گگ",
    exerciseText: "ا گ ا گ اا گگ ا گ گ ا اا گگ",
    minWpm: 20,
    minAccuracy: 90,
    xpReward: 65,
    milestone: {
      title: "پەنجەی تووتە و کشانی ئاماژە (ا و گ)",
      message:
        "پەنجەی تووتەی دەستی چەپ دەچێتە سەر کلیلی ا (دوگمەی A)، و پەنجەی ئاماژەی دەستی چەپ کەمێک دەخشێت بۆ لای ڕاست بۆ کلیلی گ (دوگمەی G).",
    },
  },
  {
    id: 13,
    unitId: 1,
    title: "پێداچوونەوەی ا و گ لەگەڵ پیتەکانی ناوەڕاست",
    subtitle: "ا • گ • پێداچوونەوە",
    description: "تێکەڵکردنی دەنگداری ئەلف و پیتی گاف",
    targetKeys: ["ا", "گ", "س", "ل", "د", "ک", "ف", "ژ", " "],
    targetText: "ا د گ ک سا گل فاد ژاگ داد کاک گاس",
    exerciseText: "ا د گ ک سا گل فاد ژاگ داد کاک گاس",
    minWpm: 22,
    minAccuracy: 90,
    xpReward: 70,
  },
  {
    id: 14,
    unitId: 1,
    title: "ڕاهێنانی وشە بە ئەلف و گاف",
    subtitle: "وشەسازی ٣",
    description: "دروستکردنی وشەی شیرینی کوردی بە پیتە کراوەکان",
    targetKeys: ["ا", "گ", "س", "ل", "د", "ک", "ف", "ژ", " "],
    targetText: "داد کاک سال گا داس لا گاس کال گلا دادا",
    exerciseText: "داد کاک سال گا داس لا گاس کال گلا دادا",
    minWpm: 24,
    minAccuracy: 92,
    xpReward: 75,
  },

  // --- PAIR 4: هـ (H) & HOME ROW MASTERY ---
  {
    id: 15,
    unitId: 1,
    title: "ناساندنی پیتی هـ",
    subtitle: "هـ",
    description: "کشانی پەنجەی ئاماژەی ڕاست بۆ دوگمەی H",
    targetKeys: ["ه"],
    targetText: "ه ف ه ژ هـ ه هـ ه ف هـ ژ هـ ه",
    exerciseText: "ه ف ه ژ هـ ه هـ ه ف هـ ژ هـ ه",
    minWpm: 20,
    minAccuracy: 90,
    xpReward: 70,
    milestone: {
      title: "تەواوکردنی ڕیزی ناوەڕاست (هـ)",
      message:
        "پەنجەی ئاماژەی دەستی ڕاست کەمێک دەخشێت بۆ لای چەپ بۆ لێدانی پیتی هـ (دوگمەی H). بەم شێوەیە تەواوی ڕیزی ناوەڕاست تەواو دەکەیت.",
    },
  },
  {
    id: 16,
    unitId: 1,
    title: "پێداچوونەوەی سەرتاسەری ڕیزی ناوەڕاست",
    subtitle: "پێداچوونەوەی ڕیزی ناوەڕاست",
    description: "لێدانی تەواوی پیتەکانی ڕیزی ناوەڕاست بە خێرایی",
    targetKeys: ["ا", "س", "د", "ف", "گ", "ه", "ژ", "ک", "ل", " "],
    targetText: "اسدف گ ه ژکل ها گا سا لا کا داد کاک",
    exerciseText: "اسدف گ ه ژکل ها گا سا لا کا داد کاک",
    minWpm: 24,
    minAccuracy: 92,
    xpReward: 80,
  },
  {
    id: 17,
    unitId: 1,
    title: "مامۆستای ڕیزی ناوەڕاست: وشەسازی تەواو",
    subtitle: "وشەسازی ٤ (تەواوی ڕیزی ١)",
    description: "نووسینی خێرای وشەکانی ڕیزی ناوەڕاست پێش چوونە سەرەوە",
    targetKeys: ["ا", "س", "د", "ف", "گ", "ه", "ژ", "ک", "ل", " "],
    targetText: "ها کاه داد گاه کاک سال داس ها کاه داد",
    exerciseText: "ها کاه داد گاه کاک سال داس ها کاه داد",
    minWpm: 25,
    minAccuracy: 93,
    xpReward: 90,
  },

  // ==============================================================================================
  // UNIT 2: TOP ROW KEYS & KURDISH VOWELS (ڕیزی سەرەوە و دەنگدارەکان) — Levels 18 to 29
  // ==============================================================================================

  // --- PAIR 5: ت (T) & ر (R) ---
  {
    id: 18,
    unitId: 2,
    title: "ناساندنی کلیلی ت و ر",
    subtitle: "ت • ر",
    description: "بەرزکردنەوەی پەنجەکانی ئاماژە بۆ ڕیزی سەرەوە (T و R)",
    targetKeys: ["ت", "ر"],
    targetText: "ت ر ت ر تت رر ت ر ر ت تت رر",
    exerciseText: "ت ر ت ر تت رر ت ر ر ت تت رر",
    minWpm: 22,
    minAccuracy: 90,
    xpReward: 75,
    milestone: {
      title: "ڕیزی سەرەوە (ت و ر)",
      message:
        "پەنجەی ئاماژەی دەستی ڕاست بەرز بکەرەوە بۆ کلیلی ت (دوگمەی T)، و پەنجەی ئاماژەی دەستی چەپ بۆ کلیلی ر (دوگمەی R). هەمیشە دوای لێدان بگەڕێوە سەر شوێنی بنەڕەتی.",
    },
  },
  {
    id: 19,
    unitId: 2,
    title: "پێداچوونەوەی ت و ر لەگەڵ ڕیزی ناوەڕاست",
    subtitle: "ت • ر • پێداچوونەوە",
    description: "تێکەڵکردنی ت و ر لەگەڵ پیتە بنەڕەتییەکان",
    targetKeys: ["ت", "ر", "ا", "س", "د", "ک", "ل", " "],
    targetText: "ت د ر س تار سار تر در کات لات دار",
    exerciseText: "ت د ر س تار سار تر در کات لات دار",
    minWpm: 24,
    minAccuracy: 90,
    xpReward: 80,
  },
  {
    id: 20,
    unitId: 2,
    title: "ڕاهێنانی وشە بە ت و ر",
    subtitle: "وشەسازی ٥",
    description: "نووسینی وشەی گرنگی کوردی بە ت و ر",
    targetKeys: ["ت", "ر", "ا", "س", "د", "ک", "ل", "گ", " "],
    targetText: "دار تار کار سار کات تر گرت لات دار کار",
    exerciseText: "دار تار کار سار کات تر گرت لات دار کار",
    minWpm: 26,
    minAccuracy: 92,
    xpReward: 85,
  },

  // --- PAIR 6: ە (E) & و (W) ---
  {
    id: 21,
    unitId: 2,
    title: "دەنگدارە سەرەکییەکان: ە و و",
    subtitle: "ە • و",
    description: "ناساندنی گرنگترین دوو دەنگداری زمانی کوردی (E و W)",
    targetKeys: ["ە", "و"],
    targetText: "ە و ە و ەە وو ە و و ە ەە وو",
    exerciseText: "ە و ە و ەە وو ە و و ە ەە وو",
    minWpm: 24,
    minAccuracy: 90,
    xpReward: 80,
    milestone: {
      title: "دەنگدارەکانی ە و و",
      message:
        "پەنجەی ناوەڕاستی دەستی چەپت بەرز بکەرەوە بۆ کلیلی ە (دوگمەی E)، و پەنجەی ئەڵقەی دەستی چەپ بۆ کلیلی و (دوگمەی W).",
    },
  },
  {
    id: 22,
    unitId: 2,
    title: "پێداچوونەوەی دەنگدارەکانی ە و و",
    subtitle: "ە • و • پێداچوونەوە",
    description: "تێکەڵکردنی ە و و لەگەڵ پیتەکانی ناوەڕاست و سەرەوە",
    targetKeys: ["ە", "و", "ت", "ر", "س", "د", "ک", " "],
    targetText: "سە دە کە وە سەر دەر کەو دەست وەرد",
    exerciseText: "سە دە کە وە سەر دەر کەو دەست وەرد",
    minWpm: 26,
    minAccuracy: 90,
    xpReward: 85,
  },
  {
    id: 23,
    unitId: 2,
    title: "ڕاهێنانی وشە بە ە و و",
    subtitle: "وشەسازی ٦",
    description: "نووسینی وشەی پڕ دەنگداری کوردی",
    targetKeys: ["ە", "و", "ت", "ر", "س", "د", "ک", "ا", " "],
    targetText: "سەر دەر کەو دارە سوور کورد دەست کارە وەرد تەور",
    exerciseText: "سەر دەر کەو دارە سوور کورد دەست کارە وەرد تەور",
    minWpm: 28,
    minAccuracy: 93,
    xpReward: 90,
  },

  // --- PAIR 7: ی (Y) & ۆ (O) ---
  {
    id: 24,
    unitId: 2,
    title: "ناساندنی کلیلی ی و ۆ",
    subtitle: "ی • ۆ",
    description: "ناساندنی پیتی یێ (Y) و پیتی دەنگداری ۆ (O)",
    targetKeys: ["ی", "ۆ"],
    targetText: "ی ۆ ی ۆ یی ۆۆ ی ۆ ۆ ی یی ۆۆ",
    exerciseText: "ی ۆ ی ۆ یی ۆۆ ی ۆ ۆ ی یی ۆۆ",
    minWpm: 25,
    minAccuracy: 90,
    xpReward: 85,
    milestone: {
      title: "پیتەکانی ی و ۆ",
      message:
        "پەنجەی دەستی ڕاستت بەرز بکەرەوە بەرەو سەرەوە بۆ لێدانی کلیلی ی (دوگمەی Y) و کلیلی ۆ (دوگمەی O).",
    },
  },
  {
    id: 25,
    unitId: 2,
    title: "پێداچوونەوەی ی و ۆ",
    subtitle: "ی • ۆ • پێداچوونەوە",
    description: "تێکەڵکردنی پیتەکانی ی و ۆ لەگەڵ پیتەکانی تر",
    targetKeys: ["ی", "ۆ", "د", "ر", "س", "ت", "ک", " "],
    targetText: "دی سی تی کۆ تۆ دۆ یار کۆر دیر سیر",
    exerciseText: "دی سی تی کۆ تۆ دۆ یار کۆر دیر سیر",
    minWpm: 27,
    minAccuracy: 90,
    xpReward: 90,
  },
  {
    id: 26,
    unitId: 2,
    title: "ڕاهێنانی وشە بە ی و ۆ",
    subtitle: "وشەسازی ٧",
    description: "نووسینی وشەی دەوڵەمەند بە ی و ۆ",
    targetKeys: ["ی", "ۆ", "د", "ر", "س", "ت", "ک", "ا", "گ", " "],
    targetText: "یار کۆر دیر سیر تۆ دیار یاری دۆ گۆی یاری",
    exerciseText: "یار کۆر دیر سیر تۆ دیار یاری دۆ گۆی یاری",
    minWpm: 28,
    minAccuracy: 93,
    xpReward: 95,
  },

  // --- PAIR 8: پ (P) & ق (Q) ---
  {
    id: 27,
    unitId: 2,
    title: "ناساندنی کلیلی پ و ق",
    subtitle: "پ • ق",
    description: "پەنجەی تووتەی ڕاست بۆ پ (P) و پەنجەی تووتەی چەپ بۆ ق (Q)",
    targetKeys: ["پ", "ق"],
    targetText: "پ ق پ ق پپ قق پ ق ق پ پپ قق",
    exerciseText: "پ ق پ ق پپ قق پ ق ق پ پپ قق",
    minWpm: 26,
    minAccuracy: 90,
    xpReward: 90,
    milestone: {
      title: "پیتەکانی پ و ق",
      message:
        "پەنجەی تووتەی دەستی ڕاست بەرز بکەرەوە بۆ پ (دوگمەی P)، و پەنجەی تووتەی دەستی چەپ بەرز بکەرەوە بۆ ق (دوگمەی Q).",
    },
  },
  {
    id: 28,
    unitId: 2,
    title: "پێداچوونەوەی پ و ق",
    subtitle: "پ • ق • پێداچوونەوە",
    description: "تێکەڵکردنی پ و ق لەگەڵ سەرجەم پیتەکانی سەرەوە و ناوەڕاست",
    targetKeys: ["پ", "ق", "ە", "ر", "د", "ل", "ا", " "],
    targetText: "پە قە پار قار پەر قەل پۆل قەد قەر",
    exerciseText: "پە قە پار قار پەر قەل پۆل قەد قەر",
    minWpm: 28,
    minAccuracy: 90,
    xpReward: 95,
  },
  {
    id: 29,
    unitId: 2,
    title: "ڕاهێنانی وشە بە پ و ق",
    subtitle: "وشەسازی ٨",
    description: "نووسینی وشەی گرنگ بە پیتە تایبەتەکانی پ و ق",
    targetKeys: ["پ", "ق", "ە", "ر", "د", "ل", "ا", "ۆ", "ی", " "],
    targetText: "پیر پۆل قەد قەر پەر قەل قاپ پەل پیر پۆل",
    exerciseText: "پیر پۆل قەد قەر پەر قەل قاپ پەل پیر پۆل",
    minWpm: 30,
    minAccuracy: 93,
    xpReward: 100,
  },

  // ==============================================================================================
  // UNIT 3: BOTTOM ROW KEYS (ڕیزی خوارەوە و ڕستەسازی) — Levels 30 to 38
  // ==============================================================================================

  // --- PAIR 9: ب (B) & ن (N) ---
  {
    id: 30,
    unitId: 3,
    title: "ناساندنی کلیلی ب و ن",
    subtitle: "ب • ن",
    description: "دابەزین بۆ ڕیزی خوارەوە بە پەنجەکانی ئاماژە (B و N)",
    targetKeys: ["ب", "ن"],
    targetText: "ب ن ب ن بب نن ب ن ن ب بب نن",
    exerciseText: "ب ن ب ن بب نن ب ن ن ب بب نن",
    minWpm: 26,
    minAccuracy: 90,
    xpReward: 95,
    milestone: {
      title: "ڕیزی خوارەوە (ب و ن)",
      message:
        "پەنجەی ئاماژەی دەستی چەپت دابەزێنە خوارەوە بۆ کلیلی ب (دوگمەی B)، و پەنجەی ئاماژەی دەستی ڕاست بۆ کلیلی ن (دوگمەی N).",
    },
  },
  {
    id: 31,
    unitId: 3,
    title: "پێداچوونەوەی ب و ن",
    subtitle: "ب • ن • پێداچوونەوە",
    description: "تێکەڵکردنی ب و ن لەگەڵ پیتەکانی تر",
    targetKeys: ["ب", "ن", "ا", "ە", "ر", "د", "ی", " "],
    targetText: "با نا بەر نەر بین بان ناب بەرد نان",
    exerciseText: "با نا بەر نەر بین بان ناب بەرد نان",
    minWpm: 28,
    minAccuracy: 90,
    xpReward: 100,
  },
  {
    id: 32,
    unitId: 3,
    title: "ڕاهێنانی وشە بە ب و ن",
    subtitle: "وشەسازی ٩",
    description: "نووسینی وشەی بەناوبانگی کوردی بە ب و ن",
    targetKeys: ["ب", "ن", "ا", "ە", "ر", "د", "ی", "ه", " "],
    targetText: "بان ناب باران بەرد نان بەهار بین بەند باران",
    exerciseText: "بان ناب باران بەرد نان بەهار بین بەند باران",
    minWpm: 30,
    minAccuracy: 93,
    xpReward: 105,
  },

  // --- PAIR 10: م (M) & ڤ (V) ---
  {
    id: 33,
    unitId: 3,
    title: "ناساندنی کلیلی م و ڤ",
    subtitle: "م • ڤ",
    description: "پەنجەی دەستی ڕاست بۆ م (M) و پەنجەی دەستی چەپ بۆ پیتی ڤ (V)",
    targetKeys: ["م", "ڤ"],
    targetText: "م ڤ م ڤ مم ڤڤ م ڤ ڤ م مم ڤڤ",
    exerciseText: "م ڤ م ڤ مم ڤڤ م ڤ ڤ م مم ڤڤ",
    minWpm: 28,
    minAccuracy: 90,
    xpReward: 100,
    milestone: {
      title: "پیتەکانی م و ڤ",
      message:
        "پەنجەی دەستی ڕاست دابەزێنە بۆ کلیلی م (دوگمەی M)، و پەنجەی ئاماژەی چەپ دابەزێنە بۆ پیتی تایبەتی کوردی ڤ (دوگمەی V).",
    },
  },
  {
    id: 34,
    unitId: 3,
    title: "پێداچوونەوەی م و ڤ",
    subtitle: "م • ڤ • پێداچوونەوە",
    description: "تێکەڵکردنی م و ڤ لەگەڵ پیتە کراوەکان",
    targetKeys: ["م", "ڤ", "ا", "ی", "ن", "ە", "ر", " "],
    targetText: "ما ڤا مەر ڤین مان مال ڤان نام مەرد",
    exerciseText: "ما ڤا مەر ڤین مان مال ڤان نام مەرد",
    minWpm: 30,
    minAccuracy: 90,
    xpReward: 105,
  },
  {
    id: 35,
    unitId: 3,
    title: "ڕاهێنانی وشە بە م و ڤ",
    subtitle: "وشەسازی ١٠",
    description: "دروستکردنی وشەی شیرین بە م و ڤ",
    targetKeys: ["م", "ڤ", "ا", "ی", "ن", "ە", "ر", "ل", "گ", "س", "د", "ک", " "],
    targetText: "مال مانگ ماسی ڤین ڤان مەرد نامە دایک مانگ",
    exerciseText: "مال مانگ ماسی ڤین ڤان مەرد نامە دایک مانگ",
    minWpm: 32,
    minAccuracy: 93,
    xpReward: 110,
  },

  // --- PAIR 11: خ (X) & ج (C) ---
  {
    id: 36,
    unitId: 3,
    title: "ناساندنی کلیلی خ و ج",
    subtitle: "خ • ج",
    description: "پەنجەی دەستی چەپ بۆ خ (X) و پەنجەی ناوەڕاست بۆ ج (C)",
    targetKeys: ["خ", "ج"],
    targetText: "خ ج خ ج خخ جج خ ج ج خ خخ جج",
    exerciseText: "خ ج خ ج خخ جج خ ج ج خ خخ جج",
    minWpm: 30,
    minAccuracy: 90,
    xpReward: 105,
    milestone: {
      title: "پیتەکانی خ و ج",
      message:
        "پەنجەی دەستی چەپ دابەزێنە بۆ خ (دوگمەی X)، و پەنجەی ناوەڕاست دابەزێنە بۆ ج (دوگمەی C).",
    },
  },
  {
    id: 37,
    unitId: 3,
    title: "پێداچوونەوەی خ و ج",
    subtitle: "خ • ج • پێداچوونەوە",
    description: "تێکەڵکردنی خ و ج لەگەڵ سەرجەم پیتەکانی خوارەوە",
    targetKeys: ["خ", "ج", "ا", "ک", "و", "ن", "ە", " "],
    targetText: "خا جا خاک جوان خەو جان جادە خان باخ",
    exerciseText: "خا جا خاک جوان خەو جان جادە خان باخ",
    minWpm: 32,
    minAccuracy: 90,
    xpReward: 110,
  },
  {
    id: 38,
    unitId: 3,
    title: "ڕاهێنانی وشە بە خ و ج",
    subtitle: "وشەسازی ١١",
    description: "تەواوکردنی هەموو پیتە ئاساییەکانی تەختەکلیل بە وشەی جوان",
    targetKeys: ["خ", "ج", "ا", "ک", "و", "ن", "ە", "د", "ب", " "],
    targetText: "خاک جوان خەو جان جادە خان باخ جوان خاک",
    exerciseText: "خاک جوان خەو جان جادە خان باخ جوان خاک",
    minWpm: 34,
    minAccuracy: 93,
    xpReward: 120,
  },

  // ==============================================================================================
  // UNIT 4: SHIFT KEY MODIFIERS (پیتە لاوەکییەکان بە کلیلی Shift) — Levels 39 to 46
  // ==============================================================================================

  // --- SHIFT PAIR 1: ش (Shift+S) & ڵ (Shift+L) ---
  {
    id: 39,
    unitId: 4,
    title: "ناساندنی کلیلی Shift: ش و ڵ",
    subtitle: "ش • ڵ (بە کلیلی Shift)",
    description: "گرتنی کلیلی Shift بۆ لێدانی پیتی شین (ش) و لامی گەورە (ڵ)",
    targetKeys: ["ش", "ڵ"],
    targetText: "ش ڵ ش ڵ شش ڵڵ ش ڵ ڵ ش شش ڵڵ",
    exerciseText: "ش ڵ ش ڵ شش ڵڵ ش ڵ ڵ ش شش ڵڵ",
    minWpm: 22,
    minAccuracy: 88,
    xpReward: 120,
    milestone: {
      title: "پیتە لاوەکییەکان بە کلیلی Shift",
      message:
        "کلیلی Shift بە پەنجەی تووتە ڕابگرە لە کاتێکدا بە دەستەکەی ترت لە پیتەکانی ش یان ڵ دەدەیت. بە بەرکەوتنی Shift پیتە لاوەکییە گرنگەکان دەردەکەون!",
    },
  },
  {
    id: 40,
    unitId: 4,
    title: "پێداچوونەوەی ش و ڵ",
    subtitle: "ش • ڵ • پێداچوونەوە",
    description: "تێکەڵکردنی ش و ڵ لەگەڵ پیتە بنەڕەتییەکان",
    targetKeys: ["ش", "ڵ", "ا", "ر", "د", "گ", "و", " "],
    targetText: "شا دڵ گوڵ شاد شار دڵ گوڵ شاد کەڵک",
    exerciseText: "شا دڵ گوڵ شاد شار دڵ گوڵ شاد کەڵک",
    minWpm: 25,
    minAccuracy: 90,
    xpReward: 125,
  },
  {
    id: 41,
    unitId: 4,
    title: "ڕاهێنانی وشە بە ش و ڵ",
    subtitle: "وشەسازی ١٢ (Shift)",
    description: "نووسینی وشەی گرنگی کوردی بە ش و ڵ",
    targetKeys: ["ش", "ڵ", "ا", "ر", "د", "گ", "و", "ک", "ە", " "],
    targetText: "شار دڵ گوڵ شاد کەشک شا لاڵ کەڵک شار دڵ",
    exerciseText: "شار دڵ گوڵ شاد کەشک شا لاڵ کەڵک شار دڵ",
    minWpm: 28,
    minAccuracy: 92,
    xpReward: 130,
  },

  // --- SHIFT PAIR 2: ڕ (Shift+R) & ێ (Shift+Y) ---
  {
    id: 42,
    unitId: 4,
    title: "ناساندنی پیتەکانی ڕ و ێ",
    subtitle: "ڕ • ێ (بە کلیلی Shift)",
    description: "گرتنی Shift بۆ لێدانی ڕێی قەڵەو (ڕ) و یێی دەنگدار (ێ)",
    targetKeys: ["ڕ", "ێ"],
    targetText: "ڕ ێ ڕ ێ ڕڕ ێێ ڕ ێ ێ ڕ ڕڕ ێێ",
    exerciseText: "ڕ ێ ڕ ێ ڕڕ ێێ ڕ ێ ێ ڕ ڕڕ ێێ",
    minWpm: 24,
    minAccuracy: 88,
    xpReward: 130,
    milestone: {
      title: "پیتەکانی ڕ و ێ بە Shift",
      message:
        "پەنجەی تووتەی دەستی چەپ بخەرە سەر Shift و بە پەنجەی ئاماژە لە کلیلی ڕ (Shift+R) یان کلیلی ێ (Shift+Y) بدە.",
    },
  },
  {
    id: 43,
    unitId: 4,
    title: "پێداچوونەوەی ڕ و ێ",
    subtitle: "ڕ • ێ • پێداچوونەوە",
    description: "تێکەڵکردنی ڕ و ێ لەگەڵ ش و ڵ",
    targetKeys: ["ڕ", "ێ", "ش", "ڵ", "ا", "ر", "د", "گ", " "],
    targetText: "ڕێ ڕێگا شێر دڵسۆز شۆڕش پیرۆز گوڵزار",
    exerciseText: "ڕێ ڕێگا شێر دڵسۆز شۆڕش پیرۆز گوڵزار",
    minWpm: 26,
    minAccuracy: 90,
    xpReward: 135,
  },
  {
    id: 44,
    unitId: 4,
    title: "ڕاهێنانی وشە بە ڕ و ێ",
    subtitle: "وشەسازی ١٣ (Shift)",
    description: "نووسینی دەستەواژەی دەوڵەمەندی کوردی",
    targetKeys: ["ڕ", "ێ", "ش", "ڵ", "ا", "ر", "د", "گ", "ز", "س", "ۆ", "پ", " "],
    targetText: "ڕێ ڕێگا دڵسۆز شێر پیرۆز گوڵزار ڕێباز شۆڕش",
    exerciseText: "ڕێ ڕێگا دڵسۆز شێر پیرۆز گوڵزار ڕێباز شۆڕش",
    minWpm: 28,
    minAccuracy: 92,
    xpReward: 140,
  },

  // --- SHIFT PAIR 3: چ (Shift+C) & GRAND FINALE ---
  {
    id: 45,
    unitId: 4,
    title: "ناساندنی پیتی چ",
    subtitle: "چ (Shift+C)",
    description: "تەواوکردنی دوایین پیتی تایبەتی کوردی (چێ)",
    targetKeys: ["چ"],
    targetText: "چ چ چ چ چا چەم چۆن چاو چیا چاکە",
    exerciseText: "چ چ چ چ چا چەم چۆن چاو چیا چاکە",
    minWpm: 28,
    minAccuracy: 90,
    xpReward: 150,
  },
  {
    id: 46,
    unitId: 4,
    title: "پاڵەوانی گەورەی پیتیک",
    subtitle: "ڕستەی تەواوی نیشتمانی",
    description: "تاقیکردنەوەی پایانی لەسەر تەواوی تەختەکلیلی کوردی",
    targetKeys: ["ک", "و", "ر", "د", "س", "ت", "ا", "ن", "ی", "ج", "ڵ", "ۆ", "ز", "گ", "ە", "ل", "م", "پ", "خ", "ێ"],
    targetText: "کوردستان نیشتمانی جوان و دڵسۆزی گەلەکەمانە و پیتیک فێربوونی خێرایە",
    exerciseText: "کوردستان نیشتمانی جوان و دڵسۆزی گەلەکەمانە و پیتیک فێربوونی خێرایە",
    minWpm: 35,
    minAccuracy: 95,
    xpReward: 250,
    milestone: {
      title: "پیرۆزبایی! تۆ بوویتە مامۆستای تەختەکلیل",
      message:
        "پیرۆزە! هەموو ٤٦ ئاستەکەت بە سەرکەوتوویی تێپەڕاند و ئێستا بەبێ سەیرکردنی دەستەکانت دەتوانیت بە خێرایی لەسەر تەختەکلیلی کوردی بنووسیت!",
    },
  },
];

export default levels;
