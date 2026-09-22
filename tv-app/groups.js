// Named subsets of each character set (see SETS in strokes.js), used by the trace game's group picker.
// GROUPS[setId] = ordered list of {id, label, chars}. Every set always has an 'all' entry equal to
// SETS[setId].chars, so "no group selected" and "All" are the same code path in the engine.
const VOWELS_UPPER = [...'AEIOU'], VOWELS_LOWER = [...'aeiou']

// Hiragana/katakana chars (in strokes.js) are already ordered in gojuon rows - split by row size rather than
// hand-retyping the kana, so this can never drift from strokes.js. Label = the row's first kana + " row".
const ROW_SIZES = [5, 5, 5, 5, 5, 5, 5, 3, 5, 3]
function rowGroups(chars) {
  const groups = [{ id: 'all', label: 'All', chars }]
  let i = 0
  for (let k = 0; k < ROW_SIZES.length; k++) {
    const n = ROW_SIZES[k], slice = chars.slice(i, i + n)
    groups.push({ id: 'row' + k, label: slice[0] + ' row', chars: slice })
    i += n
  }
  return groups
}

const GROUPS = {
  upper: [
    { id: 'all', label: 'All', chars: SETS.upper.chars },
    { id: 'vowels', label: 'Vowels', chars: VOWELS_UPPER },
    { id: 'consonants', label: 'Consonants', chars: SETS.upper.chars.filter((c) => !VOWELS_UPPER.includes(c)) },
    // ponytail: handwriting research favors grouping by stroke-motor similarity over vowels/consonants (e.g.
    // Handwriting Without Tears' "Frog Jump" family below) - builds muscle memory, fewer letter reversals.
    // Left as an example, not wired up: the user asked for vowels/consonants, not stroke families.
    // { id: 'frog-jump', label: 'Frog Jump', chars: [...'FEDPBRNM'] },
  ],
  lower: [
    { id: 'all', label: 'All', chars: SETS.lower.chars },
    { id: 'vowels', label: 'Vowels', chars: VOWELS_LOWER },
    { id: 'consonants', label: 'Consonants', chars: SETS.lower.chars.filter((c) => !VOWELS_LOWER.includes(c)) },
  ],
  digits: [{ id: 'all', label: 'All', chars: SETS.digits.chars }], // no natural subgroup
  hiragana: rowGroups(SETS.hiragana.chars),
  katakana: rowGroups(SETS.katakana.chars),
}
