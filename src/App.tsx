import {
  Button,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import {
  concat,
  head,
  isEqual,
  keys,
  last,
  map,
  random,
  range,
  reduce,
  some,
  values,
} from 'lodash/fp'
import { Datum } from 'plotly.js'
import { useCallback, useMemo, useRef } from 'react'
import Plot from 'react-plotly.js'
import { useImmer } from 'use-immer'
import Perceptron from './classes/Perceptron'

export type TPoint = [number, number]

const increment = (x: number) => x + 1
const decrement = (x: number) => x - 1

const getRandomPoint = (): TPoint => [random(-10, 10), random(-10, 10)]

// FIXME: Maximum call stack size exceeded
const appendRandomPoint = (points: TPoint[]): TPoint[] => {
  const point: TPoint = getRandomPoint()
  return some(isEqual(point), points)
    ? appendRandomPoint(points)
    : [...points, point]
}

const initialPoints = (inputsLength = 20) =>
  Array(inputsLength - 1)
    .fill(null)
    .reduce(appendRandomPoint, [getRandomPoint()])

const isPointAbove = ([x, y]: TPoint, perceptron: Perceptron) =>
  Boolean(perceptron.activate([x, y, perceptron.bias]))

const App = () => {
  const [points, setPoints] = useImmer<TPoint[]>(initialPoints)
  const [slope, setSlope] = useImmer(1)
  const [intercept, setIntercept] = useImmer(0)
  const [table, setTable] = useImmer<any>([])
  const [isLearning, setIsLearning] = useImmer(false)

  const f = useCallback(
    (x: number) => slope * x + intercept,
    [slope, intercept]
  )

  const [xs, ys] = useMemo(
    () =>
      reduce(
        ([xs, ys]: number[][], x) => [concat(xs, x), concat(ys, f(x))],
        [[], []],
        range(-11, 11)
      ),
    [f]
  )

  const ref = useRef(null)

  const handleLearn = useCallback(() => {
    const xs = points.map((point) => point[0])
    const ys = points.map((point) => point[1])

    const desired = Array(points.length)
      .fill(null)
      .map((_, i) => +(ys[i] > f(xs[i])))

    const perceptron = new Perceptron(2)

    setIsLearning(true)

    setTimeout(() => {
      setTable(
        Array(100)
          .fill(null)
          .flatMap((_, epoch) =>
            Array(points.length)
              .fill(null)
              .flatMap((_, i) => ({
                ...perceptron.train([xs[i], ys[i]], desired[i]),
                epoch,
              }))
          )
      )

      setIsLearning(false)

      ref.current = perceptron
    }, 0)
  }, [points, f, setTable, setIsLearning])

  const [sortedPoints, setSortedPoints] = useImmer<
    [TPoint, TPoint, 'above' | 'below'][]
  >([[], []])

  return (
    <>
      <Heading as='h2' size='lg'>
        Points: {points.length}
      </Heading>
      <Button
        size='sm'
        onClick={() => {
          setTable([])
          ref.current = null
          setPoints((draft) => void draft.pop())
        }}
      >
        -
      </Button>
      <Button
        size='sm'
        onClick={() => {
          setTable([])
          ref.current = null
          setPoints(appendRandomPoint)
        }}
      >
        +
      </Button>
      <Heading as='h2' size='lg'>
        <Text>a = {slope}</Text>
      </Heading>
      <Button
        size='sm'
        onClick={() => {
          setTable([])
          ref.current = null
          setSlope(decrement)
        }}
      >
        -
      </Button>
      <Button
        size='sm'
        onClick={() => {
          setTable([])
          ref.current = null
          setSlope(increment)
        }}
      >
        +
      </Button>
      <Heading as='h2' size='lg'>
        <Text>b = {intercept}</Text>
      </Heading>
      <Button
        size='sm'
        onClick={() => {
          setTable([])
          ref.current = null
          setIntercept(decrement)
        }}
      >
        -
      </Button>
      <Button
        size='sm'
        onClick={() => {
          setTable([])
          ref.current = null
          setIntercept(increment)
        }}
      >
        +
      </Button>
      <Heading as='h2' size='lg'>
        f(x) = {slope} * x + {intercept}
      </Heading>
      <Plot
        data={[
          {
            x: map(head, points) as Datum[],
            y: map(last, points) as Datum[],
            mode: 'markers',
          },
          {
            x: xs,
            y: ys,
            mode: 'lines',
          },
        ]}
        layout={{ title: 'Perceptron' }}
      />
      <Button
        size='sm'
        isLoading={isLearning}
        loadingText='Learning'
        spinnerPlacement='end'
        disabled={!!ref.current}
        onClick={handleLearn}
      >
        Learn
      </Button>
      <TableContainer height={300} overflowY='scroll'>
        <Table size='sm'>
          <Thead>
            <Tr>
              {keys(table[0]).map((header, index) => (
                <Th key={index} isNumeric>
                  {header}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {table.map((row, index) => (
              <Tr key={index}>
                {values(row).map((value, index) => (
                  <Td key={index} isNumeric>
                    {value}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {ref.current && (
        <>
          <Plot
            data={[
              {
                x: sortedPoints[0].map((point) => point[0]),
                y: sortedPoints[0].map((point) => point[1]),
                mode: 'markers',
              },
              {
                x: sortedPoints[1].map((point) => point[0]),
                y: sortedPoints[1].map((point) => point[1]),
                mode: 'markers',
              },
              {
                x: xs,
                y: ys,
                mode: 'lines',
              },
            ]}
            layout={{ title: 'Perceptron' }}
          />
          <Heading as='h2' size='lg'>
            Points: {sortedPoints.flat().length}
          </Heading>
          <Button
            size='sm'
            onClick={() =>
              setSortedPoints(
                (draft) =>
                  void (draft[2] === 'above' ? draft[0].pop() : draft[1].pop())
              )
            }
          >
            -
          </Button>
          <Button
            size='sm'
            onClick={() =>
              setSortedPoints((draft) => {
                const point = getRandomPoint()
                if (isPointAbove(point, ref.current)) {
                  draft[0].push(point)
                  draft[2] = 'above'
                } else {
                  draft[1].push(point)
                  draft[2] = 'below'
                }
              })
            }
          >
            +
          </Button>
        </>
      )}
    </>
  )
}

export default App
