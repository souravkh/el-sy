import type { Lens } from './types'
import { clamp, makeCanvas, mulberry32 } from './utils'

const PALETTE = ['#d6402b', '#e8683a', '#7a2f8f', '#b02a4a', '#9a3aa8']

function isSkin(r: number, g: number, b: number) {
  const q = g / r
  const w = b / r
  return r > 90 && r > g && g > b && q > 0.6 && q < 0.85 && w > 0.42 && w < 0.7
}

export const scribble: Lens = {
  id: 'scribble',
  label: 'Thread scribble',
  privacy: 'partial',
  param: { label: 'Thread density', min: 1, max: 10, step: 1, default: 5 },
  apply(input, strength) {
    const { width: w, height: h, data } = input
    const k = Math.sqrt(w * h) / 260
    const area = (w * h) / (260 * 260)
    const { ctx: c } = makeCanvas(w, h)

    c.putImageData(input, 0, 0)
    c.fillStyle = 'rgba(10,8,22,0.45)'
    c.fillRect(0, 0, w, h)

    const skinAt = (x: number, y: number) => {
      const xi = clamp(Math.floor(x), 0, w - 1)
      const yi = clamp(Math.floor(y), 0, h - 1)
      const p = (yi * w + xi) * 4
      return isSkin(data[p], data[p + 1], data[p + 2])
    }

    const rnd = mulberry32(33)
    c.lineCap = 'round'
    c.lineWidth = Math.max(1, k)

    const curves = Math.round(strength * 38 * area)
    const step = 4 * k
    for (let n = 0; n < curves; n++) {
      let x = rnd() * w
      let y = rnd() * h
      let a = rnd() * Math.PI * 2
      c.strokeStyle = PALETTE[Math.floor(rnd() * PALETTE.length)]
      c.globalAlpha = 0.8
      for (let s = 0; s < 34; s++) {
        const nx = x + Math.cos(a) * step
        const ny = y + Math.sin(a) * step
        a += (rnd() - 0.5) * 1.3
        if (!skinAt(nx, ny)) {
          c.beginPath()
          c.moveTo(x, y)
          c.lineTo(nx, ny)
          c.stroke()
        }
        x = nx
        y = ny
      }
    }

    const stars = Math.round(strength * 26 * area)
    for (let n = 0; n < stars; n++) {
      const x = rnd() * w
      const y = rnd() * h
      if (skinAt(x, y)) continue
      c.strokeStyle = PALETTE[Math.floor(rnd() * 3)]
      const r = (2.5 + rnd() * 2.5) * k
      c.beginPath()
      for (let j = 0; j < 3; j++) {
        const a = (j * Math.PI) / 3
        c.moveTo(x - Math.cos(a) * r, y - Math.sin(a) * r)
        c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
      }
      c.stroke()
    }

    c.globalAlpha = 0.9
    c.strokeStyle = '#e6cf3a'
    const keep = 0.45 + strength * 0.055
    const rowGap = Math.max(2, Math.round(3 * k))
    for (let y = 0; y < h; y += rowGap) {
      let x = 0
      while (x < w) {
        if (skinAt(x, y) && rnd() < keep) {
          const len = (5 + rnd() * 10) * k
          const yy = y + (rnd() - 0.5) * 1.2 * k
          c.beginPath()
          c.moveTo(x, yy)
          c.lineTo(Math.min(w, x + len), yy)
          c.stroke()
          x += len + rnd() * 3 * k
        } else {
          x += rowGap
        }
      }
    }
    c.globalAlpha = 1

    return c.getImageData(0, 0, w, h)
  },
}
