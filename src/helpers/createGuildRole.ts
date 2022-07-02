import { Requirement, role } from '@guildxyz/sdk'
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
          minAmount: 1,
        } as unknown as { amount: number },
      },
    ],
  })
  // Update verified holders
  const verifiedHolderRole = await role.get(env.VERIFIED_HOLDER_ROLE_ID)
  const requirements = verifiedHolderRole.requirements
    .map((r) => {
      if (r.type !== 'ERC721') {
        return
      }
      return {
        type: r.type,
        chain: r.chain,
        address: r.address,
        data: {
          minAmount: 1,
        } as unknown as { amount: number },
      }
    })
    .filter((r) => !!r) as Requirement[]
  if (!requirements.find((r) => 'address' in r && r.address === address)) {
    requirements.push({
      type: 'ERC721',
      chain: 'GOERLI',
      address,
      data: {
        minAmount: 1,
      } as unknown as { amount: number },
    })
    await role.update(env.VERIFIED_HOLDER_ROLE_ID, wallet.address, signer, {
      name: verifiedHolderRole.name,
      logic: 'OR',
      requirements,
    })
  }
}
