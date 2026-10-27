import type { Lens } from './types'
import { blank, blockAverage, hexToRgb } from './utils'

const BG = hexToRgb('#10201c')
const DOT = hexToRgb('#5dcaa5')

export const dotMatrix: Lens = {
  id: 'dotMatrix',
  label: 'Dot matrix',
  privacy: 'strong',
  param: { label: 'Dot spacing', min: 4, max: 24, step: 1, default: 8 },
  apply(input, strength) {
    const { width: w, height: h } = input
    const out = blank(w, h, BG)
    const d = out.data
    const c = Math.max(3, Math.round(strength))
    for (let y = 0; y < h; y += c) {
      for (let x = 0; x < w; x += c) {
        const xe = Math.min(x + c, w)
        const ye = Math.min(y + c, h)
        const [, , , l] = blockAverage(input, x, y, xe, ye)
        const r = Math.pow(l / 255, 0.7) * c * 0.5
        if (r < 0.6) continue
        const cx = x + c / 2
        const cy = y + c / 2
        for (let j = y; j < ye; j++) {
          for (let i = x; i < xe; i++) {
            const dx = i + 0.5 - cx
            const dy = j + 0.5 - cy
            if (dx * dx + dy * dy <= r * r) {
              const p = (j * w + i) * 4
              d[p] = DOT[0]
              d[p + 1] = DOT[1]
              d[p + 2] = DOT[2]
            }
          }
        }
      }
    }
    return out
  },
}
