import 'module-alias/register'
import 'source-map-support/register'

import {
  SCERC721Derivative,
  SCERC721Derivative__factory,
  SCEmailDerivative,
  SCEmailDerivative__factory,
} from '@big-whale-labs/seal-cred-ledger-contract'
import { guild } from '@guildxyz/sdk'
import createGuildRole from '@/helpers/createGuildRole'
import defaultProvider from '@/helpers/defaultProvider'
import env from '@/helpers/env'
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
  console.log('Getting SCERC721Ledger events...')
  const erc721Filter = sCERC721Ledger.filters.CreateDerivativeContract()
  const erc721Events = await sCERC721Ledger.queryFilter(erc721Filter)
  let derivativeTokens: (SCEmailDerivative | SCERC721Derivative)[] =
    erc721Events.map((e) =>
      SCERC721Derivative__factory.connect(
        e.args.derivativeContract,
        defaultProvider
      )
    )
  console.log(
    `Got SCERC721Ledger events! Derivative tokens count: ${derivativeTokens.length}`
  )
  console.log('Getting SCEmailLedger events...')
  const emailFilter = sCEmailLedger.filters.CreateDerivativeContract()
  const emailEvents = await sCEmailLedger.queryFilter(emailFilter)
  const emailTokens = emailEvents.map((e) =>
    SCEmailDerivative__factory.connect(
      e.args.derivativeContract,
      defaultProvider
    )
  )
  derivativeTokens = [...derivativeTokens, ...emailTokens]
  console.log(
    `Got SCEmailLedger events! Derivative tokens count: ${derivativeTokens.length}`
  )
  console.log('Getting derivative token names...')
  const derivativeNamesAndTokens = (
    await Promise.all(derivativeTokens.map((t) => t.name()))
  )
    .map((n) => n.replace(' (derivative)', '').replace(' email', ''))
    .map((n, i) => ({ name: getName(n), derivative: derivativeTokens[i] }))
  console.log(`Got derivative tokens names!`)
  const rolesToCreate = derivativeNamesAndTokens.filter(
    ({ name }) => !roleNamesMap[name]
  )
  for (const { name, derivative } of rolesToCreate) {
    await createGuildRole(name, derivative.address)
  }
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
