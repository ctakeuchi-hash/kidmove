import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

export const CACHE_DIR = new URL('./cache/', import.meta.url).pathname
mkdirSync(CACHE_DIR, { recursive: true })

const TEMPLATE = process.env.IMAGE_PROMPT_TEMPLATE ||
  'cute cartoon {theme}, simple flat illustration, transparent background, kid-friendly'

// Provider interface: { ext, generate(prompt, theme) -> Promise<Buffer> }. Add a provider = add an entry here.
const providers = {
  // FLUX.1 schnell on Together AI: fast (~1-3s) and cheap. Set TOGETHER_API_KEY.
  together: {
    ext: 'jpg',
    async generate(prompt) {
      const res = await fetch('https://api.together.ai/v1/images/generations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: process.env.IMAGE_MODEL || 'black-forest-labs/FLUX.1-schnell', prompt,
          width: 1024, height: 576, n: 1, response_format: 'base64', output_format: 'jpeg' }),
        signal: AbortSignal.timeout(30000),
      })
      if (!res.ok) throw new Error(`together ${res.status}: ${(await res.text()).slice(0, 200)}`)
      const b64 = (await res.json()).data?.[0]?.b64_json
      if (!b64) throw new Error('together: no image in response')
      return Buffer.from(b64, 'base64')
    },
  },
  // No API key needed: a local placeholder that waits like a real generation, for demos/tests.
  mock: {
    ext: 'svg',
    async generate(_prompt, theme) {
      await new Promise((r) => setTimeout(r, +process.env.MOCK_DELAY_MS || 2500))
      const h = parseInt(createHash('sha1').update(theme).digest('hex').slice(0, 4), 16) % 360
      return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 576">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h} 70% 55%)"/><stop offset="1" stop-color="hsl(${(h + 60) % 360} 70% 35%)"/></linearGradient></defs>
<rect width="1024" height="576" fill="url(#g)"/>
<circle cx="180" cy="130" r="70" fill="#fff" opacity=".25"/><circle cx="860" cy="440" r="110" fill="#fff" opacity=".2"/>
<text x="512" y="520" font-family="Arial Black,Arial" font-size="64" fill="#fff" opacity=".6" text-anchor="middle">${theme}</text></svg>`)
    },
  },
}
const name = process.env.IMAGE_PROVIDER || (process.env.TOGETHER_API_KEY ? 'together' : 'mock')
const provider = providers[name]
if (!provider) throw new Error(`unknown IMAGE_PROVIDER "${name}" (have: ${Object.keys(providers)})`)
console.log(`images: provider=${name}`)

// Themes come from speech/LLM output: keep letters, digits, spaces only.
export const cleanTheme = (t) => String(t).toLowerCase().replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 60)

const inflight = new Map() // file -> Promise, so a repeated request during generation doesn't generate twice
// Cached on disk by provider + theme, so repeats (even after a restart) are instant and free.
export function getThemeImage(theme) {
  const key = cleanTheme(theme)
  if (!key) return Promise.reject(new Error('empty theme'))
  const file = `${name}-${createHash('sha1').update(key).digest('hex').slice(0, 16)}.${provider.ext}`
  const result = (cached) => ({ url: `/theme-assets/${file}`, theme: key, cached })
  if (existsSync(CACHE_DIR + file)) return Promise.resolve(result(true))
  if (!inflight.has(file)) inflight.set(file, (async () => {
    try {
      writeFileSync(CACHE_DIR + file, await provider.generate(TEMPLATE.replace('{theme}', key), key))
      return result(false)
    } finally { inflight.delete(file) }
  })())
  return inflight.get(file)
}
