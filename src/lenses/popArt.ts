import type { Lens } from './types'
import { grayscale, hexToRgb } from './utils'

const PALETTE = ['#181446', '#d62864', '#fcc41e', '#fff8e8'].map(hexToRgb)

export const popArt: Lens = {
  id: 'popArt',
  label: 'Pop art',
  privacy: 'style',
  param: { label: 'Brightness', min: -60, max: 60, step: 1, default: 0 },
  apply(input, strength) {
    const { width: w, height: h } = input
    const g = grayscale(input)
    const out = new ImageData(w, h)
    const o = out.data
    for (let i = 0; i < g.length; i++) {
      const q = Math.min(3, Math.max(0, Math.floor((g[i] + strength) / 64)))
      const c = PALETTE[q]
      const p = i * 4
      o[p] = c[0]
      o[p + 1] = c[1]
      o[p + 2] = c[2]
      o[p + 3] = 255
    }
    return out
  },
}
