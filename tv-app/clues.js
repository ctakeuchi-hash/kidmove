// Picture (emoji) + word clues per character: shown while tracing and spoken when a character is completed.
// Hand-authored (not derived from KanjiVG like kana.js) - original content, not CC BY-SA.
// Not every character has a natural clue (る/を/ん, and a couple of others) - CLUES[ch] may be undefined;
// callers must treat a missing entry as "no clue", never an error.
const CLUES = {}

const LETTER_CLUES = {
  A: ['🍎', 'Apple'], B: ['🐻', 'Bear'], C: ['🐱', 'Cat'], D: ['🐶', 'Dog'], E: ['🐘', 'Elephant'],
  F: ['🐸', 'Frog'], G: ['🍇', 'Grapes'], H: ['🏠', 'House'], I: ['🍦', 'Ice cream'], J: ['🧃', 'Juice'],
  K: ['🪁', 'Kite'], L: ['🦁', 'Lion'], M: ['🌙', 'Moon'], N: ['🥜', 'Nut'], O: ['🐙', 'Octopus'],
  P: ['🐧', 'Penguin'], Q: ['👑', 'Queen'], R: ['🌈', 'Rainbow'], S: ['☀️', 'Sun'], T: ['🐯', 'Tiger'],
  U: ['☂️', 'Umbrella'], V: ['🌋', 'Volcano'], W: ['🐋', 'Whale'], X: ['🎷', 'Xylophone'], Y: ['🪀', 'Yo-yo'], Z: ['🦓', 'Zebra'],
}
for (const [L, [emoji, word]] of Object.entries(LETTER_CLUES)) {
  CLUES[L] = { emoji, word }; CLUES[L.toLowerCase()] = { emoji, word }
}

// Digits: a counting clue (subitizing / one-to-one correspondence) rather than "starts with the letter",
// which doesn't apply to numbers.
const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
for (let n = 0; n < 10; n++) CLUES[n] = CLUES[String(n)] = { emoji: n ? '🍎'.repeat(n) : '—', word: NUMBER_WORDS[n] }

// Hiragana: word given in hiragana (spoken via the existing ja-JP voice). る/を/ん have no natural clue word
// and are left out on purpose - the renderer/speech skip a character with no CLUES entry.
const HIRAGANA_CLUES = {
  あ: ['🐜', 'あり'], い: ['🐶', 'いぬ'], う: ['🐴', 'うま'], え: ['✏️', 'えんぴつ'], お: ['🍬', 'おかし'],
  か: ['🦀', 'かに'], き: ['🦒', 'きりん'], く: ['☁️', 'くも'], け: ['💨', 'けむり'], こ: ['🧊', 'こおり'],
  さ: ['🐟', 'さかな'], し: ['🦌', 'しか'], す: ['🍉', 'すいか'], せ: ['🦗', 'せみ'], そ: ['🌤️', 'そら'],
  た: ['🐙', 'たこ'], ち: ['🦋', 'ちょうちょ'], つ: ['🌙', 'つき'], て: ['✋', 'て'], と: ['🐦', 'とり'],
  な: ['🍆', 'なす'], に: ['🌈', 'にじ'], ぬ: ['🧸', 'ぬいぐるみ'], ね: ['🐱', 'ねこ'], の: ['🌿', 'のり'],
  は: ['🌸', 'はな'], ひ: ['✈️', 'ひこうき'], ふ: ['🎈', 'ふうせん'], へ: ['🐍', 'へび'], ほ: ['⭐', 'ほし'],
  ま: ['⭕', 'まる'], み: ['🍊', 'みかん'], む: ['🐛', 'むし'], め: ['👓', 'めがね'], も: ['🍑', 'もも'],
  や: ['⛰️', 'やま'], ゆ: ['❄️', 'ゆき'], よ: ['🌙', 'よる'],
  ら: ['🦁', 'らいおん'], り: ['🍎', 'りんご'], れ: ['🍋', 'れもん'], ろ: ['🕯️', 'ろうそく'],
  わ: ['🐊', 'わに'],
}
for (const [ch, [emoji, word]] of Object.entries(HIRAGANA_CLUES)) CLUES[ch] = { emoji, word }

// Katakana: default to the same mora's hiragana clue, with a few overrides for words that are actually
// loanwords and so are conventionally written in katakana (ice cream, cake, TV, ramen).
const HIRA_TO_KATA = {
  あ: 'ア', い: 'イ', う: 'ウ', え: 'エ', お: 'オ',
  か: 'カ', き: 'キ', く: 'ク', け: 'ケ', こ: 'コ',
  さ: 'サ', し: 'シ', す: 'ス', せ: 'セ', そ: 'ソ',
  た: 'タ', ち: 'チ', つ: 'ツ', て: 'テ', と: 'ト',
  な: 'ナ', に: 'ニ', ぬ: 'ヌ', ね: 'ネ', の: 'ノ',
  は: 'ハ', ひ: 'ヒ', ふ: 'フ', へ: 'ヘ', ほ: 'ホ',
  ま: 'マ', み: 'ミ', む: 'ム', め: 'メ', も: 'モ',
  や: 'ヤ', ゆ: 'ユ', よ: 'ヨ',
  ら: 'ラ', り: 'リ', れ: 'レ', ろ: 'ロ',
  わ: 'ワ',
}
for (const [hira, kata] of Object.entries(HIRA_TO_KATA)) if (CLUES[hira]) CLUES[kata] = CLUES[hira]
Object.assign(CLUES, {
  ア: { emoji: '🍦', word: 'アイス' },
  テ: { emoji: '📺', word: 'テレビ' },
  ケ: { emoji: '🍰', word: 'ケーキ' },
  ラ: { emoji: '🍜', word: 'ラーメン' },
})
