import 'module-alias/register'
import 'source-map-support/register'

import {
  externalSCERC721LedgerContract,
  sCERC721LedgerContract,
  sCEmailLedgerContract,
} from '@/helpers/ledgerContracts'
import { role } from '@guildxyz/sdk'
import addToVerifiedHolder from '@/helpers/addToVerifiedHolder'
import env from '@/helpers/env'
import expect504 from '@/helpers/expect504'
import signer from '@/helpers/signer'
import wallet from '@/helpers/wallet'

void (async () => {
  console.log('Checking ledgers...')
  await checkLedgers()
  console.log('Checked ledgers!')
  console.log('Starting listeners...')
  startListeners()
  console.log('App started!')
})()

async function checkLedgers() {
  console.log('Checking ledgers...')
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
  console.log('Updating the verified holders...')
  const verifiedHolderRole = await role.get(env.VERIFIED_HOLDER_ROLE_ID)
  console.log(`Got ${verifiedHolderRole.requirements.length} requirements`)
  const existingAddressesMap = verifiedHolderRole.requirements.reduce(
    (acc, r) => {
      if ('address' in r) {
        acc[r.address] = true
      }
      return acc
    },
    {} as { [address: string]: boolean }
  )
  const newAddresses = derivativeTokens.filter(
    (t) => !(t in existingAddressesMap)
  )
  console.log(`New addresses count: ${newAddresses.length}`)
  if (newAddresses.length > 0) {
    console.log('Adding new addresses to verified holders...')
    const requirements = verifiedHolderRole.requirements.concat(
      newAddresses.map((a) => ({
        type: 'ERC721',
        chain: 'GOERLI',
        address: a,
        data: {
          minAmount: 1,
        },
      }))
    )
    console.log(
      `Setting requirements for Verified Holder role (${requirements.length})...`
    )
    if (env.isDev) {
      console.log(`Not adding requirement in development`)
    } else {
      await expect504(
        role.update(env.VERIFIED_HOLDER_ROLE_ID, wallet.address, signer, {
          name: verifiedHolderRole.name,
          logic: 'OR',
          requirements,
        })
      )
    }
  }
}

function startListeners() {
  externalSCERC721LedgerContract.on(
    externalSCERC721LedgerContract.filters.CreateDerivativeContract(),
    async (_, derivativeContract) => {
      console.log(
        `New derivative token (ExternalERC721): ${derivativeContract}`
      )
      await addToVerifiedHolder(derivativeContract)
    }
  )
  sCERC721LedgerContract.on(
    sCERC721LedgerContract.filters.CreateDerivativeContract(),
    async (_, derivativeContract) => {
      console.log(`New derivative token: ${derivativeContract} (ERC721)`)
      await addToVerifiedHolder(derivativeContract)
    }
  )
  sCEmailLedgerContract.on(
    sCEmailLedgerContract.filters.CreateDerivativeContract(),
    async (_, derivativeContract) => {
      console.log(`New derivative token (Email): ${derivativeContract}`)
      await addToVerifiedHolder(derivativeContract)
    }
  )
}
