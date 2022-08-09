import 'module-alias/register'
import 'source-map-support/register'

import addToVerifiedHolder from '@/helpers/addToVerifiedHolder'
import ledgerContracts from '@/helpers/ledgerContracts'

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
  for (const contract of ledgerContracts) {
    console.log(`Getting ${contract.address} events...`)
    const filter = contract.filters.CreateDerivative()
    const events = await contract.queryFilter(filter)
    console.log(
      `Got ${contract.address} events! Derivative tokens count: ${derivativeTokens.length}`
    )
    derivativeTokens = [
      ...derivativeTokens,
      ...events.map((e) => e.args.derivative),
    ]
  }
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
  for (const contract of ledgerContracts) {
    contract.on(
      contract.filters.CreateDerivative(),
      (_, derivativeContract) => {
        console.log(
          `New derivative token (ExternalERC721): ${derivativeContract}`
        )
        queue.push(derivativeContract)
      }
    )
  }
}
