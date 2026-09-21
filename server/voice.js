import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ maxRetries: 1, timeout: 8000 }) // key from ANTHROPIC_API_KEY
// ponytail: Opus 5 is the skill's default; for snappier/cheaper commands set KMG_MODEL=claude-haiku-4-5 (drop effort then).
const MODEL = process.env.KMG_MODEL || 'claude-opus-5'

const noArgs = { type: 'object', properties: {}, additionalProperties: false }
const TOOLS = [
  { name: 'change_theme', strict: true,
    description: 'Change the visual theme of the game to whatever the user asks for, e.g. "dogs in a jungle" or "space unicorns". Pass a short noun phrase.',
    input_schema: { type: 'object', properties: { theme: { type: 'string', description: 'Short kid-friendly subject, 1-5 words' } }, required: ['theme'], additionalProperties: false } },
  { name: 'switch_game', strict: true,
    description: 'Switch which game is being played: "letters" = letter tracing / sky-writing, "jump" = the jumping / dodging obstacles game.',
    input_schema: { type: 'object', properties: { name: { type: 'string', enum: ['letters', 'jump'] } }, required: ['name'], additionalProperties: false } },
  { name: 'restart_game', description: 'Restart the game from the first letter.', input_schema: noArgs },
  { name: 'next_letter', description: 'Skip to the next letter.', input_schema: noArgs },
  { name: 'set_difficulty', description: 'Make tracing easier or harder.', strict: true,
    input_schema: { type: 'object', properties: { level: { type: 'string', enum: ['easy', 'medium', 'hard'] } }, required: ['level'], additionalProperties: false } },
]
const SYSTEM = `You turn a child's or parent's spoken words into game commands for a letter-tracing game. ` +
  `Speech transcripts are noisy. If the words clearly ask for one of the tools, call it. ` +
  `If they don't (chatter, cheering, unrelated speech), call no tool and reply with a few words.`

// Returns {name, input} for a matched command, or null. Never throws: a failed API call means "no command".
export async function interpret(transcript) {
  try {
    const res = await client.messages.create({
      model: MODEL, max_tokens: 1024, system: SYSTEM, tools: TOOLS, tool_choice: { type: 'auto' },
      output_config: { effort: 'low' },
      messages: [{ role: 'user', content: String(transcript).slice(0, 300) }],
    })
    const use = res.content.find((b) => b.type === 'tool_use')
    return use ? { name: use.name, input: use.input } : null // refusal / max_tokens also land here as "no command"
  } catch (e) {
    console.error('voice interpret failed:', e instanceof Anthropic.APIError ? `${e.status} ${e.message}` : e.message)
    return null
  }
}
