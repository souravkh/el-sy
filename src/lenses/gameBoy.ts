import type { Lens } from './types'
import { blockAverage, fillBlock, hexToRgb } from './utils'

const PALETTE = ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'].map(hexToRgb)
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

export const gameBoy: Lens = {
  id: 'gameBoy',
  label: 'Game Boy',
  privacy: 'style',
  param: { label: 'Pixel size', min: 2, max: 8, step: 1, default: 3 },
  apply(input, strength) {
    const { width: w, height: h } = input
    const out = new ImageData(w, h)
    const k = Math.max(2, Math.round(strength))
    for (let y = 0; y < h; y += k) {
      for (let x = 0; x < w; x += k) {
        const xe = Math.min(x + k, w)
        const ye = Math.min(y + k, h)
        const [, , , l] = blockAverage(input, x, y, xe, ye)
        const bx = Math.floor(x / k) % 4
        const by = Math.floor(y / k) % 4
        const v = l + (BAYER[by * 4 + bx] / 16 - 0.5) * 60
        const q = Math.min(3, Math.max(0, Math.floor(v / 64)))
        fillBlock(out, x, y, xe, ye, PALETTE[q])
      }
    }
    return out
  },
}
