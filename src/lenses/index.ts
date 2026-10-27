import type { Lens } from './types'
import { pixel } from './pixel'
import { dotMatrix } from './dotMatrix'
import { glitch } from './glitch'
import { stainedGlass } from './stainedGlass'
import { popArt } from './popArt'
import { gameBoy } from './gameBoy'
import { scribble } from './scribble'
import { tetris } from './tetris'

export const lenses: Lens[] = [
  pixel,
  dotMatrix,
  glitch,
  stainedGlass,
  popArt,
  gameBoy,
  scribble,
  tetris,
]

export function lensById(id: string): Lens | undefined {
  return lenses.find((l) => l.id === id)
}

export type { Lens, LensParam, Privacy } from './types'
export { PRIVACY_LABEL } from './types'
