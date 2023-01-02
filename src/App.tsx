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
      <Stack justifyContent='center' alignItems='center' mt={12}>
        <Heading as='h2' size='lg' textAlign='center'>
          Zbiór uczący "L"
        </Heading>
        <Text w='100%' maxW={1068} fontSize='xl' textAlign='justify'>
          Wygeneruj zbiór uczący "L" losując dowolną ilość punktów. Modyfikuj
          parametry liniowej funkcji{' '}
          <Highlight
            query='f(x)'
            styles={{
              p: 1,
              borderRadius: '0.375rem',
              bg: 'orange.400',
            }}
          >
            f(x)
          </Highlight>
          .
          <br />
          Kliknij przycisk poniżej, by nauczyć perceptron rozróżniania punktów
          znajdujących się powyżej lub poniżej funkcji{' '}
          <Highlight
            query='f(x)'
            styles={{
              p: 1,
              borderRadius: '0.375rem',
              bg: 'orange.400',
            }}
          >
            f(x)
          </Highlight>
          .
        </Text>
        <HStack>
          <Stack rowGap={4} w={360} h={270}>
            <Stack spacing={4}>
              <HStack justify='space-between'>
                <Heading as='h2' size='lg'>
                  <Highlight
                    query={`Punkty: ${points.length}`}
                    styles={{
                      p: 1,
                      borderRadius: '0.375rem',
                      color: 'white',
                      bg: 'blue.400',
                    }}
                  >
                    {`Punkty: ${points.length}`}
                  </Highlight>
                </Heading>
                <HStack>
                  <Button
                    onClick={() => {
                      setSteps([])
                      ref.current = null
                      setPoints((draft) => void draft.pop())
                    }}
                  >
                    <MinusIcon />
                  </Button>
                  <Button
                    onClick={() => {
                      setSteps([])
                      ref.current = null
                      setPoints(appendRandomPoint)
                    }}
                  >
                    <AddIcon />
                  </Button>
                </HStack>
              </HStack>
              <HStack justify='space-between'>
                <Heading as='h2' size='lg'>
                  <Highlight
                    query='a'
                    styles={{
                      p: 1,
                      borderRadius: '0.375rem',
                      color: 'white',
                      bg: 'green.400',
                    }}
                  >
                    a
                  </Highlight>{' '}
                  = {slope}
                </Heading>
                <HStack>
                  <Button
                    onClick={() => {
                      setSteps([])
                      ref.current = null
                      setSlope(decrement)
                    }}
                  >
                    <MinusIcon />
                  </Button>
                  <Button
                    onClick={() => {
                      setSteps([])
                      ref.current = null
                      setSlope(increment)
                    }}
                  >
                    <AddIcon />
                  </Button>
                </HStack>
              </HStack>
              <HStack justify='space-between'>
                <Heading as='h2' size='lg'>
                  <Highlight
                    query='b'
                    styles={{
                      p: 1,
                      borderRadius: '0.375rem',
                      color: 'white',
                      bg: 'red.400',
                    }}
                  >
                    b
                  </Highlight>{' '}
                  = {intercept}
                </Heading>
                <HStack>
                  <Button
                    onClick={() => {
                      setSteps([])
                      ref.current = null
                      setIntercept(decrement)
                    }}
                  >
                    <MinusIcon />
                  </Button>
                  <Button
                    onClick={() => {
                      setSteps([])
                      ref.current = null
                      setIntercept(increment)
                    }}
                  >
                    <AddIcon />
                  </Button>
                </HStack>
              </HStack>
            </Stack>
            <Heading as='h2' size='lg'>
              <Highlight
                query='f(x)'
                styles={{
                  p: 1,
                  borderRadius: '0.375rem',
                  bg: 'orange.400',
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
                  bg: 'green.400',
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
                  bg: 'gray.400',
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
                  bg: 'red.400',
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
                name: 'Punkty',
                marker: {
                  color: '#4299E1',
                },
              },
              {
                x: xs,
                y: ys,
                mode: 'lines',
                name: `f(x) = ${slope} * x + ${intercept}`,
                line: {
                  color: '#ED8936',
                },
              },
            ]}
            layout={{
              font: {
                color: 'white',
              },
              plot_bgcolor: '#1a202c',
              paper_bgcolor: '#1a202c',
            }}
          />
        </HStack>
      </Stack>
      <HStack justify='center'>
        <Button
          isLoading={isLearning}
          loadingText='Perceptron uczy się'
          spinnerPlacement='end'
          disabled={!!ref.current}
          onClick={handleLearn}
          mb={12}
        >
          Rozpocznij naukę
        </Button>
      </HStack>
      {ref.current && (
        <>
          <Stack justifyContent='center' alignItems='center' mb={12}>
            <Heading as='h2' size='lg' textAlign='center'>
              Proces uczenia
            </Heading>
            <Text fontSize='xl' textAlign='center'>
              Poniżej znajduje się krokowy proces uczenia perceptronu
            </Text>
          </Stack>
          <LearningSteps steps={steps} />
          <Stack justifyContent='center' alignItems='center' mt={12}>
            <Heading as='h2' size='lg' textAlign='center'>
              Test perceptronu
            </Heading>
            <Text fontSize='xl' textAlign='center'>
              Przetestuj perceptron losowo wygenerowanymi punktami
            </Text>
          </Stack>
          <HStack justify='center'>
            <HStack justify='space-between' w={360}>
              <Heading as='h2' size='lg'>
                <Highlight
                  query={`Punkty: ${
                    isEmpty(sortedPoints.flat())
                      ? 0
                      : sortedPoints.slice(0, -1).flat().length
                  }`}
                  styles={{
                    p: 1,
                    borderRadius: '0.375rem',
                    color: 'white',
                    bg:
                      last(sortedPoints[2]) === 'above'
                        ? 'blue.400'
                        : last(sortedPoints[2]) === 'below'
                        ? 'green.400'
                        : 'transparent',
                  }}
                >
                  {`Punkty: ${
                    isEmpty(sortedPoints.flat())
                      ? 0
                      : sortedPoints.slice(0, -1).flat().length
                  }`}
                </Highlight>
              </Heading>
              <HStack>
                <Button
                  onClick={() =>
                    setSortedPoints((draft) => {
                      last(draft[2]) === 'above'
                        ? draft[0].pop()
                        : draft[1].pop()
                      draft[2].pop()
                    })
                  }
                >
                  <MinusIcon />
                </Button>
                <Button
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
                  <AddIcon />
                </Button>
              </HStack>
            </HStack>
            <Plot
              data={[
                {
                  x: sortedPoints[0].map((point) => point[0]),
                  y: sortedPoints[0].map((point) => point[1]),
                  mode: 'markers',
                  name: `${String.fromCharCode(0x3e)} f(x)`,
                  marker: {
                    color: '#4299E1',
                  },
                },
                {
                  x: sortedPoints[1].map((point) => point[0]),
                  y: sortedPoints[1].map((point) => point[1]),
                  mode: 'markers',
                  name: `${String.fromCharCode(0x2264)} f(x)`,
                  marker: { color: '#48BB78' },
                },
                {
                  x: xs,
                  y: ys,
                  mode: 'lines',
                  name: `f(x) = ${slope} * x + ${intercept}`,
                  line: {
                    color: '#ED8936',
                  },
                },
              ]}
              layout={{
                paper_bgcolor: '#1a202c',
                plot_bgcolor: '#1a202c',
                font: {
                  color: 'white',
                },
              }}
            />
          </HStack>
        </>
      )}
    </>
  )
}

export default App
