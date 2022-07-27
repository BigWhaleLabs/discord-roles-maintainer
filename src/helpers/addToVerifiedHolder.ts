import { ERC721__factory } from '@big-whale-labs/seal-cred-ledger-contract'
import { role } from '@guildxyz/sdk'
import defaultProvider from '@/helpers/defaultProvider'
import env from '@/helpers/env'
import expect504 from '@/helpers/expect504'
import signer from '@/helpers/signer'
import wallet from '@/helpers/wallet'

export default async function (...addresses: string[]) {
  console.log(`Adding requirements ${addresses.length}...`)
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
  const newAddresses = addresses.filter((t) => !(t in existingAddressesMap))
  console.log(`New addresses count: ${newAddresses.length}`)
  // Filter for names and symbols to be UTF-8
  const newAddressesFiltered = [] as string[]
  for (const address of newAddresses) {
    try {
      const contract = ERC721__factory.connect(address, defaultProvider)
      const name = await contract.name()
      const symbol = await contract.symbol()
      console.log(name, symbol, !/\0/g.test(name) && !/\0/g.test(symbol))
      if (!/\0/g.test(name) && !/\0/g.test(symbol)) {
        newAddressesFiltered.push(address)
      }
    } catch (error) {
      console.log(
        `Failed to check ${address} for UTF-8 compatibility`,
        error instanceof Error ? error.message : error
      )
    }
  }
  if (newAddressesFiltered.length > 0) {
    console.log('Adding new addresses to verified holders...')
    const requirements = verifiedHolderRole.requirements.concat(
      newAddressesFiltered.map((a) => ({
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
    if (requirements.length < 1300) {
      console.log(`Not adding requirement in development, too few requirements`)
      return
    }
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
  } else {
    console.log('No new addresses to add')
  }
}
