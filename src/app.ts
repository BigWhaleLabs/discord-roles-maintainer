import 'module-alias/register'
import 'source-map-support/register'

import {
  externalSCERC721LedgerContract,
  sCERC721LedgerContract,
  sCEmailLedgerContract,
} from '@/helpers/ledgerContracts'
import addToVerifiedHolder from '@/helpers/addToVerifiedHolder'

void (async () => {
  console.log('Checking ledgers...')
  await checkLedgers()
  console.log('Checked ledgers!')
  console.log('Starting listeners...')
  startListeners()
  console.log('Starting queue checker...')
  startCheckingQueue()
  console.log('App started!')
})()

async function checkLedgers() {
  let derivativeTokens = [] as string[]
  console.log('Getting SCERC721Ledger events...')
  const erc721Filter = sCERC721LedgerContract.filters.CreateDerivativeContract()
  const erc721Events = await sCERC721LedgerContract.queryFilter(erc721Filter)
  derivativeTokens = erc721Events.map((e) => e.args.derivativeContract)
  console.log(
    `Got SCERC721Ledger events! Derivative tokens count: ${derivativeTokens.length}`
  )
  console.log('Getting ExternalSCERC721Ledger events...')
  const externalErc721Filter =
    externalSCERC721LedgerContract.filters.CreateDerivativeContract()
  const externalErc721Events = await externalSCERC721LedgerContract.queryFilter(
    externalErc721Filter
  )
  const externalTokens = externalErc721Events.map(
    (e) => e.args.derivativeContract
  )
  derivativeTokens = [...derivativeTokens, ...externalTokens]
  console.log(
    `Got ExternalSCERC721Ledger events! Derivative tokens count: ${derivativeTokens.length}`
  )
  console.log('Getting SCEmailLedger events...')
  const emailFilter = sCEmailLedgerContract.filters.CreateDerivativeContract()
  const emailEvents = await sCEmailLedgerContract.queryFilter(emailFilter)
  const emailTokens = emailEvents.map((e) => e.args.derivativeContract)
  derivativeTokens = [...derivativeTokens, ...emailTokens]
  console.log(
    `Got SCEmailLedger events! Derivative tokens count: ${derivativeTokens.length}`
  )
  await addToVerifiedHolder(...derivativeTokens)
}

let queue = [] as string[]
let isUpdating = false
function startCheckingQueue() {
  setInterval(async () => {
    if (isUpdating) {
      return
    }
    isUpdating = true
    const tempQueue = [...queue]
    queue = []
    try {
      if (tempQueue.length) {
        await addToVerifiedHolder(...tempQueue)
      }
    } catch (error) {
      console.error(
        'Error updating the role',
        error instanceof Error ? error.message : error
      )
      queue = [...queue, ...tempQueue]
    } finally {
      isUpdating = false
    }
  }, 1 * 1000)
}

function startListeners() {
  externalSCERC721LedgerContract.on(
    externalSCERC721LedgerContract.filters.CreateDerivativeContract(),
    (_, derivativeContract) => {
      console.log(
        `New derivative token (ExternalERC721): ${derivativeContract}`
      )
      queue.push(derivativeContract)
    }
  )
  sCERC721LedgerContract.on(
    sCERC721LedgerContract.filters.CreateDerivativeContract(),
    (_, derivativeContract) => {
      console.log(`New derivative token (ERC721): ${derivativeContract}`)
      queue.push(derivativeContract)
    }
  )
  sCEmailLedgerContract.on(
    sCEmailLedgerContract.filters.CreateDerivativeContract(),
    (_, derivativeContract) => {
      console.log(`New derivative token (Email): ${derivativeContract}`)
      queue.push(derivativeContract)
    }
  )
}
