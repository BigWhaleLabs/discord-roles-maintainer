import 'module-alias/register'
import 'source-map-support/register'

import {
  SCERC721Derivative,
  SCERC721Derivative__factory,
  SCEmailDerivative,
  SCEmailDerivative__factory,
} from '@big-whale-labs/seal-cred-ledger-contract'
import {
  externalSCERC721LedgerContract,
  sCERC721LedgerContract,
  sCEmailLedgerContract,
} from '@/helpers/ledgerContracts'
import { guild } from '@guildxyz/sdk'
import Network from '@/models/Network'
import cleanName from '@/helpers/cleanName'
import createGuildRole from '@/helpers/createGuildRole'
import defaultProvider from '@/helpers/defaultProvider'
import env from '@/helpers/env'
import getName from '@/helpers/getName'

void (async () => {
  console.log('Checking ledgers...')
  await checkLedgers()
  console.log('Checked ledgers!')
  console.log('Starting listeners...')
  startListeners()
  console.log('App started!')
})()

async function checkLedgers() {
  console.log('Getting existing roles...')
  const fetchedGuild = await guild.get(env.GUILD_ID)
  const roles = fetchedGuild.roles
  const roleNamesMap = roles.reduce(
    (acc, r) => ({
      ...acc,
      [r.name]: true,
    }),
    {} as { [name: string]: boolean }
  )
  console.log(`Got ${roles.length} roles!`)
  console.log('Checking ledgers...')
  let derivativeTokens = [] as {
    contract: SCEmailDerivative | SCERC721Derivative
    network: Network
  }[]
  console.log('Getting SCERC721Ledger events...')
  const erc721Filter = sCERC721LedgerContract.filters.CreateDerivativeContract()
  const erc721Events = await sCERC721LedgerContract.queryFilter(erc721Filter)
  derivativeTokens = erc721Events.map((e) => ({
    contract: SCERC721Derivative__factory.connect(
      e.args.derivativeContract,
      defaultProvider
    ),
    network: Network.goerli,
  }))
  console.log(
    `Got SCERC721Ledger events! Derivative tokens count: ${derivativeTokens.length}`
  )
  console.log('Getting ExternalSCERC721Ledger events...')
  const externalErc721Filter =
    externalSCERC721LedgerContract.filters.CreateDerivativeContract()
  const externalErc721Events = await externalSCERC721LedgerContract.queryFilter(
    externalErc721Filter
  )
  const externalTokens = externalErc721Events.map((e) => ({
    contract: SCERC721Derivative__factory.connect(
      e.args.derivativeContract,
      defaultProvider
    ),
    network: Network.mainnet,
  }))
  derivativeTokens = [...derivativeTokens, ...externalTokens]
  console.log(
    `Got ExternalSCERC721Ledger events! Derivative tokens count: ${derivativeTokens.length}`
  )
  console.log('Getting SCEmailLedger events...')
  const emailFilter = sCEmailLedgerContract.filters.CreateDerivativeContract()
  const emailEvents = await sCEmailLedgerContract.queryFilter(emailFilter)
  const emailTokens = emailEvents.map((e) => ({
    contract: SCEmailDerivative__factory.connect(
      e.args.derivativeContract,
      defaultProvider
    ),
    network: Network.goerli,
  }))
  derivativeTokens = [...derivativeTokens, ...emailTokens]
  console.log(
    `Got SCEmailLedger events! Derivative tokens count: ${derivativeTokens.length}`
  )
  console.log('Getting derivative token names...')
  const derivativeNamesAndTokens = (
    await Promise.all(
      derivativeTokens.map(async ({ contract, network }) => {
        const name = await contract.name()
        return {
          name: cleanName(name),
          network,
        }
      })
    )
  )
    .map(({ name, network }, i) => ({
      name: getName(name, network),
      derivative: derivativeTokens[i],
    }))
    .filter((n) => !n.name.includes('derivative'))
  console.log(`Got derivative tokens names!`)
  const rolesToCreate = derivativeNamesAndTokens.filter(
    ({ name }) => !roleNamesMap[name]
  )
  for (const {
    name,
    derivative: { contract },
  } of rolesToCreate) {
    await createGuildRole(name, contract.address)
  }
}

function startListeners() {
  externalSCERC721LedgerContract.on(
    externalSCERC721LedgerContract.filters.CreateDerivativeContract(),
    async (_, derivativeContract) => {
      console.log(`Creating role for ${derivativeContract} (external)`)
      const fetchedGuild = await guild.get(env.GUILD_ID)
      const roles = fetchedGuild.roles
      const roleNamesMap = roles.reduce(
        (acc, r) => ({
          ...acc,
          [r.name]: true,
        }),
        {} as { [name: string]: boolean }
      )
      const contract = SCERC721Derivative__factory.connect(
        derivativeContract,
        defaultProvider
      )
      const name = getName(cleanName(await contract.name()), Network.mainnet)
      if (name.includes('derivative') || roleNamesMap[name]) {
        console.log(`Skipping ${name}`)
        return
      }
      console.log(`Creating role for ${name} (${derivativeContract})...`)
      await createGuildRole(name, derivativeContract)
      console.log(`Created role for ${name}`)
    }
  )
  sCERC721LedgerContract.on(
    sCERC721LedgerContract.filters.CreateDerivativeContract(),
    async (_, derivativeContract) => {
      console.log(`Creating role for ${derivativeContract}`)
      const fetchedGuild = await guild.get(env.GUILD_ID)
      const roles = fetchedGuild.roles
      const roleNamesMap = roles.reduce(
        (acc, r) => ({
          ...acc,
          [r.name]: true,
        }),
        {} as { [name: string]: boolean }
      )
      const contract = SCERC721Derivative__factory.connect(
        derivativeContract,
        defaultProvider
      )
      const name = getName(cleanName(await contract.name()), Network.goerli)
      if (name.includes('derivative') || roleNamesMap[name]) {
        console.log(`Skipping ${name}`)
        return
      }
      console.log(`Creating role for ${name} (${derivativeContract})...`)
      await createGuildRole(name, derivativeContract)
      console.log(`Created role for ${name}`)
    }
  )
  sCEmailLedgerContract.on(
    sCEmailLedgerContract.filters.CreateDerivativeContract(),
    async (_, derivativeContract) => {
      console.log(`Creating role for ${derivativeContract}`)
      const fetchedGuild = await guild.get(env.GUILD_ID)
      const roles = fetchedGuild.roles
      const roleNamesMap = roles.reduce(
        (acc, r) => ({
          ...acc,
          [r.name]: true,
        }),
        {} as { [name: string]: boolean }
      )
      const contract = SCEmailDerivative__factory.connect(
        derivativeContract,
        defaultProvider
      )
      const name = getName(cleanName(await contract.name()), Network.goerli)
      if (roleNamesMap[name]) {
        console.log(`Skipping ${name}`)
        return
      }
      console.log(`Creating role for ${name} (${derivativeContract})...`)
      await createGuildRole(name, derivativeContract)
      console.log(`Created role for ${name}`)
    }
  )
}
