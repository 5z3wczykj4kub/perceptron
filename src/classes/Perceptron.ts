import { random } from 'lodash'
import { constant, map } from 'lodash/fp'
import { TPoint } from '../types'

class Perceptron {
  inputsLength: number
  learningRate: number
  weights: number[]
  bias: number

  constructor(
    inputsLength: number,
    [minWeight, maxWeight]: number[] = [-1, 1],
    learningRate = 0.5,
    bias = 1
  ) {
    this.inputsLength = inputsLength
    this.weights = map(
      constant(random(minWeight, maxWeight, true)),
      Array(inputsLength + 1).fill(null)
    )
    this.learningRate = learningRate
    this.bias = bias
  }

  activate = (inputs: number[]) =>
    +(
      Array(inputs.length)
        .fill(null)
        .reduce((x, _, i) => x + inputs[i] * this.weights[i], 0) > 0
    )

  train = (
    point: TPoint,
    desired: number,
    iteration: number,
    epoch: number
  ) => {
    const inputs = point.concat(this.bias)
    const error = desired - this.activate(inputs)
    const s =
      this.weights[0] * inputs[0] +
      this.weights[1] * inputs[1] +
      this.weights[2] * inputs[2]
    const y = +(s > 0)
    const steps = {
      epoch,
      t: iteration,
      'x0(t)': inputs[2],
      'x1(t)': inputs[0],
      'x2(t)': inputs[1],
      'd(t)': desired,
      'w0(t)': this.weights[2],
      'w1(t)': this.weights[0],
      'w2(t)': this.weights[1],
      's(t)': s,
      'y(t)': y,
      'ok?': +(error === 0),
    }
    if (error !== 0)
      Array(inputs.length)
        .fill(null)
        .forEach(
          (_, i) => (this.weights[i] += this.learningRate * inputs[i] * error)
        )
    return steps
  }
}

export default Perceptron
