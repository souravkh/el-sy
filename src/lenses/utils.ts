export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  const num = parseInt(full, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

export function blockAverage(
  input: ImageData,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): [number, number, number, number] {
  const { width, data } = input
  let r = 0
  let g = 0
  let b = 0
  let count = 0
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const p = (y * width + x) * 4
      r += data[p]
      g += data[p + 1]
      b += data[p + 2]
      count++
    }
  }
  if (count === 0) return [0, 0, 0, 0]
  const ravg = r / count
  const gavg = g / count
  const bavg = b / count
  const l = 0.299 * ravg + 0.587 * gavg + 0.114 * bavg
  return [ravg, gavg, bavg, l]
}

export function fillBlock(
  out: ImageData,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  rgb: [number, number, number] | number[],
): void {
  const { width, data } = out
  const [r, g, b] = rgb
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const p = (y * width + x) * 4
      data[p] = r
      data[p + 1] = g
      data[p + 2] = b
      data[p + 3] = 255
    }
  }
}

export function blank(
  w: number,
  h: number,
  rgb: [number, number, number] | number[] = [0, 0, 0],
): ImageData {
  const out = new ImageData(w, h)
  const [r, g, b] = rgb
  const d = out.data
  for (let i = 0; i < w * h; i++) {
    const p = i * 4
    d[p] = r
    d[p + 1] = g
    d[p + 2] = b
    d[p + 3] = 255
  }
  return out
}

export function grayscale(input: ImageData): Float32Array {
  const { width, height, data } = input
  const total = width * height
  const g = new Float32Array(total)
  for (let i = 0; i < total; i++) {
    const p = i * 4
    g[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]
  }
  return g
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

export function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeCanvas(
  w: number,
  h: number,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    throw new Error('Failed to get 2d context')
  }
  return { canvas, ctx }
}

