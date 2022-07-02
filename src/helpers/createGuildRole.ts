import { role } from '@guildxyz/sdk'
import env from '@/helpers/env'
import signer from '@/helpers/signer'
import wallet from '@/helpers/wallet'

export default async function (name: string, address: string) {
  console.log(`Creating guild role ${name} (${address})...`)
  if (env.isDev) {
    return
  }
  // Create guild role
  await role.create(wallet.address, signer, {
    guildId: env.GUILD_ID,
    name,
    logic: 'AND',
    requirements: [
      {
        type: 'ERC721',
        chain: 'GOERLI',
        address,
        data: {
          amount: 1,
        },
      },
    ],
  })
  // Update verified holders
  const verifiedHolderRole = await role.get(env.VERIFIED_HOLDER_ROLE_ID)
  const requirements = verifiedHolderRole.requirements
  requirements.push({
    type: 'ERC721',
    chain: 'GOERLI',
    address,
    data: {
      amount: 1,
    },
  })
  await role.update(env.VERIFIED_HOLDER_ROLE_ID, wallet.address, signer, {
    name,
    logic: 'OR',
    requirements,
  })
}
