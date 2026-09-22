#!/usr/bin/env node
// Self-check for the trace game's character/group/clue data (strokes.js, groups.js, clues.js).
// No test framework in this repo - plain assert-based script, same discipline as the rest of the code.
// Run: node tv-app/check.js  (or: npm test)
const assert = require('node:assert/strict')
const vm = require('node:vm')
const fs = require('node:fs')
const path = require('node:path')

const sandbox = {}
vm.createContext(sandbox)
for (const file of ['kana.js', 'strokes.js', 'groups.js', 'clues.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), sandbox, { filename: file })
}
// strokes.js/groups.js/clues.js declare their data with top-level `const`, which binds lexically in the vm
// context rather than as a property on the sandbox object - so pull them out with one more script in the
// same context, instead of destructuring `sandbox` directly.
const { SETS, GROUPS, CLUES } = vm.runInContext('({ SETS, GROUPS, CLUES })', sandbox)

// Every SETS key has a GROUPS entry whose 'all' group matches SETS[key].chars exactly.
for (const key of Object.keys(SETS)) {
  assert.ok(GROUPS[key], `GROUPS.${key} is missing`)
  const all = GROUPS[key].find((g) => g.id === 'all')
  assert.ok(all, `GROUPS.${key} has no 'all' entry`)
  assert.deepEqual(all.chars, SETS[key].chars, `GROUPS.${key}.all doesn't match SETS.${key}.chars`)
}

// Every group's characters are a subset of the set's characters (catches typos in hand-authored groups).
for (const key of Object.keys(GROUPS)) {
  const valid = new Set(SETS[key].chars)
  for (const g of GROUPS[key]) for (const c of g.chars) assert.ok(valid.has(c), `GROUPS.${key}.${g.id} has '${c}', not in SETS.${key}.chars`)
}

// Hiragana/katakana row groups concatenate back to exactly the full character list (catches row-size slicing errors).
for (const key of ['hiragana', 'katakana']) {
  const rows = GROUPS[key].filter((g) => g.id !== 'all')
  assert.deepEqual(rows.flatMap((g) => g.chars), SETS[key].chars, `GROUPS.${key} rows don't reconstruct SETS.${key}.chars`)
}

// Vowels + consonants exactly partition the alphabet, for upper/lower.
for (const key of ['upper', 'lower']) {
  const vowels = GROUPS[key].find((g) => g.id === 'vowels').chars
  const consonants = GROUPS[key].find((g) => g.id === 'consonants').chars
  assert.equal(vowels.length + consonants.length, SETS[key].chars.length, `${key}: vowels+consonants should cover every character`)
  assert.equal(new Set([...vowels, ...consonants]).size, vowels.length + consonants.length, `${key}: vowels/consonants overlap`)
}

// Shuffle sanity: 1000 shuffles of a 10-element array always yield a permutation of the input (catches an off-by-one).
function shuffleArr(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] } return a }
const sample = [...'ABCDEFGHIJ']
for (let i = 0; i < 1000; i++) {
  const shuffled = shuffleArr(sample)
  assert.equal(shuffled.length, sample.length, 'shuffle changed the length')
  assert.deepEqual([...shuffled].sort(), [...sample].sort(), 'shuffle is not a permutation of the input')
}

// Every CLUES key is a real character in some SETS[*].chars (catches stale/typo'd clue keys). Not every
// character needs a clue (る/を/ん, etc.) - that's expected, just logged, not a failure.
const allChars = new Set(Object.values(SETS).flatMap((s) => s.chars))
for (const key of Object.keys(CLUES)) assert.ok(allChars.has(key), `CLUES has a stale key '${key}' not in any character set`)
const missingClues = [...allChars].filter((ch) => !CLUES[ch]).length

console.log(`OK - ${Object.keys(SETS).length} sets, ${Object.values(GROUPS).flat().length} groups, ` +
  `${Object.keys(CLUES).length} clue entries (${missingClues}/${allChars.size} characters have no clue, expected for a few)`)
