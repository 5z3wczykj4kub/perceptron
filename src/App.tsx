import { AddIcon, MinusIcon } from '@chakra-ui/icons'
import {
  Button,
  Heading,
  Highlight,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  concat,
  head,
  isEmpty,
  isEqual,
  last,
  map,
  random,
  range,
  reduce,
  some,
} from 'lodash/fp'
import { Datum } from 'plotly.js'
import { useCallback, useMemo, useRef } from 'react'
import Plot from 'react-plotly.js'
import { useImmer } from 'use-immer'
import Perceptron from './classes/Perceptron'
import LearningSteps from './LearningSteps'
import { ILearningStep, TPoint } from './types'

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
  const [steps, setSteps] = useImmer<ILearningStep[]>([])
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
      setSteps(
        Array(100)
          .fill(null)
          .flatMap((_, epoch) =>
            Array(points.length)
              .fill(null)
              .flatMap((_, iteration) =>
                perceptron.train(
                  [xs[iteration], ys[iteration]],
                  desired[iteration],
                  iteration + epoch * points.length,
                  epoch
                )
              )
          )
      )

      setIsLearning(false)

      ref.current = perceptron
    }, 0)
  }, [points, f, setSteps, setIsLearning])

  const [sortedPoints, setSortedPoints] = useImmer<
    [TPoint, TPoint, 'above' | 'below'][]
  >([[], [], []])

  return (
    <>
      <Stack justifyContent='center' alignItems='center' mt={8}>
        <Heading as='h2' size='lg' textAlign='center'>
          Training set
        </Heading>
        <Text fontSize='xl' textAlign='center'>
          Generate random points. Adjust function parameters. Click button below
          to start the training process.
        </Text>
        <HStack>
          <Stack justify='space-between' h={270}>
            <Stack spacing={4}>
              <HStack justify='end'>
                <Heading as='h2' size='lg'>
                  <Highlight
                    query={`Points: ${points.length}`}
                    styles={{
                      p: 1,
                      borderRadius: '0.375rem',
                      color: 'white',
                      bg: 'blue.300',
                    }}
                  >
                    {`Points: ${points.length}`}
                  </Highlight>
                </Heading>
                <Button
                  size='sm'
                  onClick={() => {
                    setSteps([])
                    ref.current = null
                    setPoints((draft) => void draft.pop())
                  }}
                >
                  <MinusIcon />
                </Button>
                <Button
                  size='sm'
                  onClick={() => {
                    setSteps([])
                    ref.current = null
                    setPoints(appendRandomPoint)
                  }}
                >
                  <AddIcon />
                </Button>
              </HStack>
              <HStack justify='end'>
                <Heading as='h2' size='lg'>
                  <Highlight
                    query='a'
                    styles={{
                      p: 1,
                      borderRadius: '0.375rem',
                      color: 'white',
                      bg: 'green.300',
                    }}
                  >
                    a
                  </Highlight>{' '}
                  = {slope}
                </Heading>
                <Button
                  size='sm'
                  onClick={() => {
                    setSteps([])
                    ref.current = null
                    setSlope(decrement)
                  }}
                >
                  <MinusIcon />
                </Button>
                <Button
                  size='sm'
                  onClick={() => {
                    setSteps([])
                    ref.current = null
                    setSlope(increment)
                  }}
                >
                  <AddIcon />
                </Button>
              </HStack>
              <HStack justify='end'>
                <Heading as='h2' size='lg'>
                  <Highlight
                    query='b'
                    styles={{
                      p: 1,
                      borderRadius: '0.375rem',
                      color: 'white',
                      bg: 'red.300',
                    }}
                  >
                    b
                  </Highlight>{' '}
                  = {intercept}
                </Heading>
                <Button
                  size='sm'
                  onClick={() => {
                    setSteps([])
                    ref.current = null
                    setIntercept(decrement)
                  }}
                >
                  <MinusIcon />
                </Button>
                <Button
                  size='sm'
                  onClick={() => {
                    setSteps([])
                    ref.current = null
                    setIntercept(increment)
                  }}
                >
                  <AddIcon />
                </Button>
              </HStack>
            </Stack>
            <Heading as='h2' size='lg' textAlign='center'>
              <Highlight
                query='f(x)'
                styles={{
                  p: 1,
                  borderRadius: '0.375rem',
                  bg: 'orange.300',
                }}
              >
                f(x)
              </Highlight>{' '}
              ={' '}
              <Highlight
                query={slope.toString()}
                styles={{
                  p: 1,
                  borderRadius: '0.375rem',
                  color: 'white',
                  bg: 'green.300',
                }}
              >
                {slope.toString()}
              </Highlight>{' '}
              *{' '}
              <Highlight
                query='x'
                styles={{
                  p: 1,
                  borderRadius: '0.375rem',
                  bg: 'gray.300',
                }}
              >
                x
              </Highlight>{' '}
              +{' '}
              <Highlight
                query={intercept.toString()}
                styles={{
                  p: 1,
                  borderRadius: '0.375rem',
                  color: 'white',
                  bg: 'red.300',
                }}
              >
                {intercept.toString()}
              </Highlight>
            </Heading>
          </Stack>
          <Plot
            data={[
              {
                x: map(head, points) as Datum[],
                y: map(last, points) as Datum[],
                mode: 'markers',
                name: 'Points',
                marker: {
                  color: '#63B3ED',
                },
              },
              {
                x: xs,
                y: ys,
                mode: 'lines',
                name: `f(x) = ${slope} * x + ${intercept}`,
                line: {
                  color: '#F6AD55',
                },
              },
            ]}
            layout={{ title: 'Training set' }}
          />
        </HStack>
      </Stack>
      <HStack justify='center'>
        <Button
          isLoading={isLearning}
          loadingText='Learning'
          spinnerPlacement='end'
          disabled={!!ref.current}
          onClick={handleLearn}
          mb={12}
        >
          Learn
        </Button>
      </HStack>
      <LearningSteps steps={steps} />
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
            Points:
            {isEmpty(sortedPoints.flat())
              ? 0
              : sortedPoints.slice(0, -1).flat().length}
          </Heading>
          <Button
            size='sm'
            onClick={() =>
              setSortedPoints((draft) => {
                last(draft[2]) === 'above' ? draft[0].pop() : draft[1].pop()
                draft[2].pop()
              })
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
                  draft[2].push('above')
                } else {
                  draft[1].push(point)
                  draft[2].push('below')
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
