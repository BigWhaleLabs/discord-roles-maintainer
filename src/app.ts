import 'module-alias/register'
import 'source-map-support/register'

import {
  SCERC721Derivative__factory,
  SCEmailDerivative__factory,
} from '@big-whale-labs/seal-cred-ledger-contract'
import createGuildRole from '@/helpers/createGuildRole'
import defaultProvider from '@/helpers/defaultProvider'
import getName from '@/helpers/getName'
import sCERC721Ledger from '@/helpers/sCERC721Ledger'
import sCEmailLedger from '@/helpers/sCEmailLedger'

void (async () => {
  console.log('Checking ledgers...')
  await checkLedgers()
  console.log('Checked ledgers!')
  console.log('Starting listeners...')
  startListeners()
  console.log('App started!')
})()

// TODO: finish checking ledgers against existing roles
function checkLedgers() {
  console.log('Getting SCERC721Ledger events...')
  // const eventsFilter = sCERC721Ledger.filters.CreateDerivativeContract()
  // const events = await sCERC721Ledger.queryFilter(eventsFilter)
  console.log('Got SCERC721Ledger events!')
}

function startListeners() {
  sCERC721Ledger.on(
    sCERC721Ledger.filters.CreateDerivativeContract(),
    async (_, derivativeContract) => {
      console.log(`Creating role for ${derivativeContract}`)
      const contract = SCERC721Derivative__factory.connect(
        derivativeContract,
        defaultProvider
      )
      const symbol = await contract.symbol()
      console.log(`Creating role for ${symbol} (${derivativeContract})...`)
      const name = getName(symbol)
      await createGuildRole(name, derivativeContract)
      console.log(`Created role for ${symbol} — ${name}`)
    }
  )
  sCEmailLedger.on(
    sCEmailLedger.filters.CreateDerivativeContract(),
    async (_, derivativeContract) => {
      console.log(`Creating role for ${derivativeContract}`)
      const contract = SCEmailDerivative__factory.connect(
        derivativeContract,
        defaultProvider
      )
      const symbol = await contract.symbol()
      console.log(`Creating role for ${symbol} (${derivativeContract})...`)
      const name = getName(symbol)
      await createGuildRole(name, derivativeContract)
      console.log(`Created role for ${symbol} — ${name}`)
    }
  )
}
