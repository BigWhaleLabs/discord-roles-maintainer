import { role } from '@guildxyz/sdk'
import env from '@/helpers/env'
import expect504 from '@/helpers/expect504'
import signer from '@/helpers/signer'
import wallet from '@/helpers/wallet'

export default async function (address: string) {
  console.log(`Adding requirement ${address}...`)
  // Update verified holders
  const verifiedHolderRole = await role.get(env.VERIFIED_HOLDER_ROLE_ID)
  console.log(
    `Got Verified Holders requirements: ${verifiedHolderRole.requirements.length}`
  )
  if (verifiedHolderRole.requirements.length < 900) {
    console.log(
      'Not modifying verified holders requirements, too few requirements'
    )
  }
  const existingAddressesMap = verifiedHolderRole.requirements.reduce(
    (acc, r) => {
      if ('address' in r) {
        acc[r.address] = true
      }
      return acc
    },
    {} as { [address: string]: boolean }
  )
  if (address in existingAddressesMap) {
    console.log(`Requirement ${address} already exists in Verified Holders`)
    return
  }
  console.log(`Adding requirement ${address} to Verified Holders`)
  const requirements = verifiedHolderRole.requirements.concat({
    type: 'ERC721',
    chain: 'GOERLI',
    address,
    data: {
      minAmount: 1,
    },
  })
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
