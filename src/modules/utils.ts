import { utils, writeFileXLSX } from 'xlsx'
import { ITrainingResult, TPoint } from '../types'

export const increment = (x: number) => x + 1

export const decrement = (x: number) => x - 1

export const head = <T>(x: T[]) => x[0]

export const last = <T>(x: T[]) => x[x.length - 1]

export const exportTrainingSetToXLSX = (
  points: TPoint[],
  slope: number,
  intercept: number,
  weights: number[]
) => {
  const set = points.map(([x, y], index) => ({
    Nr: index,
    x0: x,
    y0: y,
    'f(x)': `${slope} * x + ${intercept}`,
    'Przedział wag': `[${weights[0]}, ${weights[1]}]`,
  }))
  const ws = utils.json_to_sheet(set)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Data')
  writeFileXLSX(wb, 'zbiór_uczący.xlsx')
}

export const exportTrainingResultsToXLSX = (
  trainingResults: ITrainingResult[]
) => {
  const ws = utils.json_to_sheet(trainingResults)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Data')
  writeFileXLSX(wb, 'krokowy_proces_uczenia.xlsx')
}
