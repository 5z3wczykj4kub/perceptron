import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { keys, values } from 'lodash/fp'
import { memo } from 'react'
import { ILearningStep } from './types'

interface ILearningStepsProps {
  steps: ILearningStep[]
}

const LearningSteps = ({ steps }: ILearningStepsProps) => (
  <TableContainer height={300} overflowY='scroll'>
    <Table maxW={600} mx='auto'>
      <Thead position='sticky' top={0} zIndex='docked' bg='white'>
        <Tr>
          {keys(steps[0]).map((header, index) => (
            <Th key={index} isNumeric>
              {header}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {steps.map((row, index) => (
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
)

export default memo(LearningSteps)
