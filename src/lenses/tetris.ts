import type { Lens } from './types'
import { blockAverage } from './utils'

const PALETTE: [number, number, number][] = [
  [26, 26, 46],
  [59, 78, 224],
  [162, 59, 214],
  [230, 57, 70],
  [240, 138, 36],
  [245, 214, 35],
  [60, 207, 78],
  [47, 214, 230],
  [138, 143, 163],
  [244, 244, 240],
]

function nearestColor(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  let best = PALETTE[0]
  let bestDistance = Number.POSITIVE_INFINITY

  for (const color of PALETTE) {
    const distance =
      (color[0] - r) ** 2 + (color[1] - g) ** 2 + (color[2] - b) ** 2
    if (distance < bestDistance) {
      best = color
      bestDistance = distance
    }
  }
  return best
}

export const tetris: Lens = {
  id: 'tetris',
  label: 'Tetris blocks',
  privacy: 'style',
  param: { label: 'Block size', min: 4, max: 24, step: 1, default: 10 },
  apply(input, strength) {
    const { width, height } = input
    const out = new ImageData(width, height)
    const output = out.data
    const blockSize = Math.max(2, Math.round(strength))

    for (let y = 0; y < height; y += blockSize) {
      for (let x = 0; x < width; x += blockSize) {
        const right = Math.min(x + blockSize, width)
        const bottom = Math.min(y + blockSize, height)
        const [averageR, averageG, averageB] = blockAverage(input, x, y, right, bottom)
        const [r, g, b] = nearestColor(averageR, averageG, averageB)

        for (let py = y; py < bottom; py++) {
          for (let px = x; px < right; px++) {
            const edge = Math.min(
              px - x,
              py - y,
              right - 1 - px,
              bottom - 1 - py,
            )
            const bevel = Math.max(1, Math.floor(blockSize * 0.18))
            const light = edge < bevel && (px - x <= py - y)
            const shadow = edge < bevel && !light
            const shade = light ? 1.28 : shadow ? 0.72 : 1
            const index = (py * width + px) * 4
            output[index] = Math.min(255, Math.round(r * shade))
            output[index + 1] = Math.min(255, Math.round(g * shade))
            output[index + 2] = Math.min(255, Math.round(b * shade))
            output[index + 3] = 255
          }
        }
      }
    }

    return out
  },
}
