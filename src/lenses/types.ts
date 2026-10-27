export type Privacy = 'strong' | 'partial' | 'style'

export const PRIVACY_LABEL: Record<Privacy, string> = {
  strong: 'Identity hidden well',
  partial: 'Identity partly hidden',
  style: 'Style only, identity not hidden',
}

export interface LensParam {
  label: string
  min: number
  max: number
  step: number
  default: number
}

export interface Lens {
  id: string
  label: string
  privacy: Privacy
  param: LensParam
  param2?: LensParam
  apply: (input: ImageData, strength: number, strength2?: number) => ImageData
}

