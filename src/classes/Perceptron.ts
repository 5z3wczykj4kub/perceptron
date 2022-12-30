import { random } from 'lodash'
import { constant, map } from 'lodash/fp'
import { TPoint } from '../App'

class Perceptron {
  inputsLength: number
  learningRate: number
  weights: number[]
  bias: number

  constructor(
    inputsLength: number,
    [minWeight, maxWeight] = [-1, 1],
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
        .reduce((x, _, i) => x + inputs[i] * this.weights[i], 0) >= 0
    )

  train = (point: TPoint, desired: number) => {
    const inputs = point.concat(this.bias)
    const error = desired - this.activate(inputs)
    const table = {
      epoch: '?',
      t: '?',
      'x0(t)': inputs[2],
      'x1(t)': inputs[0],
      'x2(t)': inputs[1],
      'd(t)': desired,
      'w0(t)': this.weights[2],
      'w1(t)': this.weights[0],
      'w2(t)': this.weights[1],
      's(t)': '?',
      'y(t)': '?',
      'ok?': +(error === 0),
    }
    if (error !== 0)
      Array(inputs.length)
        .fill(null)
        .forEach(
          (_, i) => (this.weights[i] += this.learningRate * inputs[i] * error)
        )
    return table
  }
}

export default Perceptron
