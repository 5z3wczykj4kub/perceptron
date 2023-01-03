export type TPoint = [number, number]

export type TPlace = 'above' | 'below'

export type TClassifiedPoints = [TPoint, TPoint, TPlace[]] | []

export interface ILearningStep {
  epoch: number
  t: number
  'x0(t)': number
  'x1(t)': number
  'x2(t)': number
  'd(t)': number
  'w0(t)': number
  'w1(t)': number
  'w2(t)': number
  's(t)': number
  'y(t)': number
  'ok?': number
}
