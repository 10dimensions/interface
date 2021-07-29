import { Trans } from '@lingui/macro'
import { ButtonSmall } from 'components/Button'
import { AutoColumn } from 'components/Column'
import PositionManageCard from 'components/earn/PositionManageCard'
import ProgramCard from 'components/earn/ProgramCard'
import Loader from 'components/Loader'
import { RowBetween, RowFixed } from 'components/Row'
import { useIncentivesForPool } from 'hooks/incentives/useAllIncentives'
import { usePoolsByAddresses } from 'hooks/usePools'
import useTheme from 'hooks/useTheme'
import { useV3PositionsForPool } from 'hooks/useV3Positions'
import { useActiveWeb3React } from 'hooks/web3'
import { LoadingRows } from 'pages/Pool/styleds'
import { Link, RouteComponentProps } from 'react-router-dom'
import styled from 'styled-components/macro'
import { HoverText, TYPE } from 'theme'
import { formattedFeeAmount } from 'utils'
import { unwrappedToken } from 'utils/unwrappedToken'

const Wrapper = styled.div`
  max-width: 840px;
  width: 100%;
`

export default function Manage({
  match: {
    params: { poolAddress },
  },
}: RouteComponentProps<{ poolAddress: string }>) {
  const theme = useTheme()
  const { account } = useActiveWeb3React()

  const [, pool] = usePoolsByAddresses([poolAddress])[0]

  const currency0 = pool ? unwrappedToken(pool.token0) : undefined
  const currency1 = pool ? unwrappedToken(pool.token1) : undefined

  // all incentive programs for this pool
  const { loading, incentives } = useIncentivesForPool(poolAddress)

  // all users positions for this pool
  const { loading: loadingPositions, positions } = useV3PositionsForPool(account, pool)

  if (!pool || !currency0 || !currency1 || loading) {
    return (
      <Wrapper>
        <LoadingRows>
          <div />
          <div />
          <div />
        </LoadingRows>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <AutoColumn gap="24px">
        <RowFixed>
          <TYPE.body color={theme.text3} mr="4px" fontWeight={500}>
            <Link style={{ textDecoration: 'none' }} to="/stake">
              <HoverText color={theme.text3}>
                <Trans>Stake</Trans>
              </HoverText>
            </Link>
          </TYPE.body>
          <TYPE.body color={theme.text3} fontWeight={500}>
            {` >  ${currency0.symbol} / ${currency1.symbol} ${formattedFeeAmount(pool.fee)}%`}
          </TYPE.body>
        </RowFixed>
        {!incentives ? (
          <TYPE.body>No incentives on this pool yet </TYPE.body>
        ) : (
          <ProgramCard poolAddress={poolAddress} incentives={incentives} hideStake={true} />
        )}
        <AutoColumn gap="12px">
          <RowBetween>
            <TYPE.body fontWeight={600} fontSize="18px">
              <Trans>Positions</Trans>
            </TYPE.body>
            <ButtonSmall padding="4px" as={Link} to={`/add/${pool.token0.address}/${pool.token1.address}`}>
              <Trans>+ Add position</Trans>
            </ButtonSmall>
          </RowBetween>
          {loadingPositions ? (
            <Loader />
          ) : !positions ? (
            <TYPE.body>No positions on this pool</TYPE.body>
          ) : (
            positions.map((p, i) => <PositionManageCard key={'position-manage-' + i} positionDetails={p} />)
          )}
        </AutoColumn>
      </AutoColumn>
    </Wrapper>
  )
}