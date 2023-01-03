import { isEqual, random as _random, some } from 'lodash/fp'
import Perceptron from '../classes/Perceptron'
import { TPoint } from '../types'

export const random = (): TPoint => [_random(-10, 10), _random(-10, 10)]

// FIXME: Maximum call stack size exceeded
export const append = (points: TPoint[]): TPoint[] => {
  const point: TPoint = random()
  return some(isEqual(point), points) ? append(points) : [...points, point]
}

export const initial = (inputsLength = 20) =>
  Array(inputsLength - 1)
    .fill(null)
    .reduce(append, [random()])

export const isAbove = ([x, y]: TPoint, perceptron: Perceptron) =>
  Boolean(perceptron.activate([x, y, perceptron.bias]))
