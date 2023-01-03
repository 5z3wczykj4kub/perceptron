import { AddIcon, DownloadIcon, MinusIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Heading,
  Highlight,
  HStack,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Stack,
  Text,
} from '@chakra-ui/react'
import { concat, isEmpty, map, range, reduce } from 'lodash/fp'
import { useCallback, useMemo, useRef } from 'react'
import Plot from 'react-plotly.js'
import { useImmer } from 'use-immer'
import Perceptron from './classes/Perceptron'
import * as POINT from './modules/point'
import {
  decrement,
  exportTrainingResultsToXLSX,
  exportTrainingSetToXLSX,
  head,
  increment,
  last,
} from './modules/utils'
import TrainingResults from './TrainingResults'
import { ITrainingResult, TClassifiedPoints, TPlace, TPoint } from './types'

const App = () => {
  const [points, setPoints] = useImmer<TPoint[]>(POINT.initial)
  const [slope, setSlope] = useImmer(1)
  const [intercept, setIntercept] = useImmer(0)
  const [weights, setWeights] = useImmer([-1, 1])
  const [trainingResults, setTrainingResults] = useImmer<ITrainingResult[]>([])
  const [isTraining, setIsTraining] = useImmer(false)
  const [classifiedPoints, setClassifiedPoints] = useImmer<TClassifiedPoints[]>(
    [[], [], []]
  )

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

  const perceptronRef = useRef<Perceptron | null>(null)

  const train = useCallback(() => {
    setIsTraining(true)
    const xs = points.map(head)
    const ys = points.map(last)
    const desired = Array(points.length)
      .fill(null)
      .map((_, i) => +(ys[i] > f(xs[i])))
    const perceptron = new Perceptron(2, weights)
    setTimeout(() => {
      setTrainingResults(
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
      perceptronRef.current = perceptron
      setIsTraining(false)
    }, 0)
  }, [points, weights, f, setTrainingResults, setIsTraining])

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
                      setTrainingResults([])
                      setClassifiedPoints([[], [], []])
                      perceptronRef.current = null
                      setPoints((draft) => void draft.pop())
                    }}
                  >
                    <MinusIcon />
                  </Button>
                  <Button
                    onClick={() => {
                      setTrainingResults([])
                      setClassifiedPoints([[], [], []])
                      perceptronRef.current = null
                      setPoints(POINT.append)
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
                      setTrainingResults([])
                      setClassifiedPoints([[], [], []])
                      perceptronRef.current = null
                      setSlope(decrement)
                    }}
                  >
                    <MinusIcon />
                  </Button>
                  <Button
                    onClick={() => {
                      setTrainingResults([])
                      setClassifiedPoints([[], [], []])
                      perceptronRef.current = null
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
                      setTrainingResults([])
                      setClassifiedPoints([[], [], []])
                      perceptronRef.current = null
                      setIntercept(decrement)
                    }}
                  >
                    <MinusIcon />
                  </Button>
                  <Button
                    onClick={() => {
                      setTrainingResults([])
                      setClassifiedPoints([[], [], []])
                      perceptronRef.current = null
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
            <Heading as='h2' size='md'>
              Przedział wag:
            </Heading>
            <RangeSlider
              aria-label={['min', 'max']}
              min={-10}
              max={10}
              title='Przedział wag'
              value={weights}
              onChange={(value) => {
                if (!perceptronRef.current) {
                  setWeights(value)
                  return
                }
                setTrainingResults([])
                setClassifiedPoints([[], [], []])
                perceptronRef.current = null
              }}
            >
              <RangeSliderTrack>
                <RangeSliderFilledTrack />
              </RangeSliderTrack>
              <RangeSliderThumb index={0} />
              <RangeSliderThumb index={1} />
              <Box
                position='absolute'
                top={4}
                display='flex'
                justifyContent='space-between'
                w='100%'
              >
                <Text>{weights[0]}</Text>
                <Text>{weights[1]}</Text>
              </Box>
            </RangeSlider>
          </Stack>
          <Plot
            data={[
              {
                x: map(head, points),
                y: map(last, points),
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
                name: `f(x) = ${slope}x + ${intercept}`,
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
          mb={8}
          colorScheme='blue'
          rightIcon={<DownloadIcon />}
          aria-label='download training results'
          onClick={() =>
            exportTrainingSetToXLSX(points, slope, intercept, weights)
          }
        >
          Pobierz
        </Button>
      </HStack>
      <HStack justify='center'>
        <Button
          isLoading={isTraining}
          loadingText='Perceptron uczy się'
          spinnerPlacement='end'
          disabled={!!perceptronRef.current}
          onClick={train}
          mb={12}
        >
          Rozpocznij naukę
        </Button>
      </HStack>
      {perceptronRef.current && (
        <>
          <Stack justifyContent='center' alignItems='center' mb={12}>
            <Heading as='h2' size='lg' textAlign='center'>
              Proces uczenia
            </Heading>
            <Text fontSize='xl' textAlign='center'>
              Poniżej znajduje się krokowy proces uczenia perceptronu
            </Text>
            <HStack justify='center'>
              <Button
                mt={4}
                colorScheme='blue'
                rightIcon={<DownloadIcon />}
                aria-label='download training results'
                onClick={() => exportTrainingResultsToXLSX(trainingResults)}
              >
                Pobierz
              </Button>
            </HStack>
          </Stack>
          <TrainingResults steps={trainingResults} />
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
                    isEmpty(classifiedPoints.flat())
                      ? 0
                      : classifiedPoints.slice(0, -1).flat().length
                  }`}
                  styles={{
                    p: 1,
                    borderRadius: '0.375rem',
                    color: 'white',
                    bg:
                      last(classifiedPoints[2] as TPlace[]) === 'above'
                        ? 'blue.400'
                        : last(classifiedPoints[2] as TPlace[]) === 'below'
                        ? 'green.400'
                        : 'transparent',
                  }}
                >
                  {`Punkty: ${
                    isEmpty(classifiedPoints.flat())
                      ? 0
                      : classifiedPoints.slice(0, -1).flat().length
                  }`}
                </Highlight>
              </Heading>
              <HStack>
                <Button
                  onClick={() =>
                    setClassifiedPoints((draft) => {
                      last(draft[2] as TPlace[]) === 'above'
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
                    setClassifiedPoints((draft) => {
                      const point = POINT.random()
                      if (POINT.isAbove(point, perceptronRef.current!)) {
                        ;(draft[0] as TPoint[]).push(point)
                        ;(draft[2] as TPlace[]).push('above')
                      } else {
                        ;(draft[1] as TPoint[]).push(point)
                        ;(draft[2] as TPlace[]).push('below')
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
                  x: (classifiedPoints[0] as TPoint[]).map(head),
                  y: (classifiedPoints[0] as TPoint[]).map(last),
                  mode: 'markers',
                  name: `${String.fromCharCode(0x3e)} f(x)`,
                  marker: {
                    color: '#4299E1',
                  },
                },
                {
                  x: (classifiedPoints[1] as TPoint[]).map(head),
                  y: (classifiedPoints[1] as TPoint[]).map(last),
                  mode: 'markers',
                  name: `${String.fromCharCode(0x2264)} f(x)`,
                  marker: { color: '#48BB78' },
                },
                {
                  x: xs,
                  y: ys,
                  mode: 'lines',
                  name: `f(x) = ${slope}x + ${intercept}`,
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
