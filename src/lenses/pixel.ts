import type { Lens } from './types'
import { blockAverage, fillBlock } from './utils'

export const pixel: Lens = {
  id: 'pixel',
  label: 'Pixel mosaic',
  privacy: 'strong',
  param: { label: 'Block size', min: 4, max: 48, step: 1, default: 14 },
  apply(input, strength) {
    const { width: w, height: h } = input
    const out = new ImageData(w, h)
    const b = Math.max(2, Math.round(strength))
    for (let y = 0; y < h; y += b) {
      for (let x = 0; x < w; x += b) {
        const xe = Math.min(x + b, w)
        const ye = Math.min(y + b, h)
        const [r, g, bl] = blockAverage(input, x, y, xe, ye)
        fillBlock(out, x, y, xe, ye, [r, g, bl])
      }
    }
    return out
  },
}
