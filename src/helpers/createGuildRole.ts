import { Requirement, role } from '@guildxyz/sdk'
import env from '@/helpers/env'
import signer from '@/helpers/signer'
import wallet from '@/helpers/wallet'

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max) + 1
}

export default async function (name: string, address: string) {
  console.log(`Creating guild role ${name} (${address})...`)
  if (env.isDev) {
    return
  }
  // Create guild role
  try {
    await role.create(wallet.address, signer, {
      imageUrl: `/guildLogos/${getRandomInt(285)}.svg`,
      platform: 'DISCORD',
      platformId: env.DISCORD_SERVER_ID,
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
  } catch (error) {
    if (error instanceof Error && error.message.includes('504')) {
      console.log('Request failed with 504, but it probably succeeded')
    } else {
      throw error
    }
  }
  // Update verified holders
  const verifiedHolderRole = await role.get(env.VERIFIED_HOLDER_ROLE_ID)
  const requirements = verifiedHolderRole.requirements
    .map((r) => {
      if (!('type' in r && 'chain' in r && 'address' in r)) {
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
    console.log(`Adding ${address} to verified holders...`)
    requirements.push({
      type: 'ERC721',
      chain: 'GOERLI',
      address,
      data: {
        minAmount: 1,
      } as unknown as { amount: number },
    })
    if (requirements.length < 60) {
      console.log('Requirements length is less than 60, not updating')
      return
    }
    await role.update(env.VERIFIED_HOLDER_ROLE_ID, wallet.address, signer, {
      name: verifiedHolderRole.name,
      logic: 'OR',
      requirements,
    })
  }
}
