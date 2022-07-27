import { role } from '@guildxyz/sdk'
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
