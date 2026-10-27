import type { Lens } from './types'
import { mulberry32 } from './utils'

export const stainedGlass: Lens = {
  id: 'stainedGlass',
  label: 'Stained glass',
  privacy: 'strong',
  param: { label: 'Shard size', min: 8, max: 48, step: 1, default: 18 },
  apply(input, strength) {
    const { width: w, height: h, data } = input
    const b = Math.max(6, Math.round(strength))
    const gw = Math.ceil(w / b)
    const gh = Math.ceil(h / b)
    const rnd = mulberry32(11)

    const sx = new Float32Array(gw * gh)
    const sy = new Float32Array(gw * gh)
    for (let j = 0; j < gh; j++) {
      for (let i = 0; i < gw; i++) {
        const k = j * gw + i
        sx[k] = (i + 0.15 + rnd() * 0.7) * b
        sy[k] = (j + 0.15 + rnd() * 0.7) * b
      }
    }

    const idx = new Int32Array(w * h)
    const acc = new Float32Array(gw * gh * 4)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const ci = Math.floor(x / b)
        const cj = Math.floor(y / b)
        let best = Infinity
        let bi = 0
        for (let dj = -1; dj <= 1; dj++) {
          for (let di = -1; di <= 1; di++) {
            const ii = ci + di
            const jj = cj + dj
            if (ii < 0 || jj < 0 || ii >= gw || jj >= gh) continue
            const k = jj * gw + ii
            const dx = sx[k] - x
            const dy = sy[k] - y
            const dd = dx * dx + dy * dy
            if (dd < best) {
              best = dd
              bi = k
            }
          }
        }
        idx[y * w + x] = bi
        const p = (y * w + x) * 4
        const a = bi * 4
        acc[a] += data[p]
        acc[a + 1] += data[p + 1]
        acc[a + 2] += data[p + 2]
        acc[a + 3]++
      }
    }

    const out = new ImageData(w, h)
    const o = out.data
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x
        const a = idx[i] * 4
        const edge =
          (x < w - 1 && idx[i + 1] !== idx[i]) ||
          (y < h - 1 && idx[i + w] !== idx[i])
        const m = edge ? 0.35 : 1
        const p = i * 4
        const count = acc[a + 3] || 1
        o[p] = (acc[a] / count) * m
        o[p + 1] = (acc[a + 1] / count) * m
        o[p + 2] = (acc[a + 2] / count) * m
        o[p + 3] = 255
      }
    }
    return out
  },
}
