import type { Lens } from './types'
import { clamp, mulberry32 } from './utils'

export const glitch: Lens = {
  id: 'glitch',
  label: 'Glitch',
  privacy: 'style',
  param: { label: 'Shift', min: 2, max: 30, step: 1, default: 8 },
  apply(input, strength) {
    const { width: w, height: h, data } = input
    const out = new ImageData(w, h)
    const o = out.data
    const rnd = mulberry32(7)
    const shift = Math.round(strength)
    let off = 0
    let left = 0
    for (let y = 0; y < h; y++) {
      if (left <= 0) {
        left = 4 + Math.floor(rnd() * Math.max(6, h / 12))
        off = rnd() < 0.45 ? Math.round((rnd() - 0.5) * shift * 4) : 0
      }
      left--
      const dim = y % 3 === 0 ? 0.78 : 1
      for (let x = 0; x < w; x++) {
        const xr = clamp(x + off + shift, 0, w - 1)
        const xg = clamp(x + off, 0, w - 1)
        const xb = clamp(x + off - shift, 0, w - 1)
        const p = (y * w + x) * 4
        o[p] = data[(y * w + xr) * 4] * dim
        o[p + 1] = data[(y * w + xg) * 4 + 1] * dim
        o[p + 2] = data[(y * w + xb) * 4 + 2] * dim
        o[p + 3] = 255
      }
    }
    return out
  },
}
