import { Requirement, role } from '@guildxyz/sdk'
import env from '@/helpers/env'
import expect504 from '@/helpers/expect504'
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
  await expect504(
    role.create(wallet.address, signer, {
      imageUrl: `/guildLogos/${getRandomInt(285)}.svg`,
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
          } as unknown as {
            minAmount: number
            maxAmount: number
          },
        },
      ],
    })
  )
  console.log(
    `Created guild role ${name} (${address}), checking Verified Holder...`
  )
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
        },
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
      } as unknown as {
        minAmount: number
        maxAmount: number
      },
    })
    if (requirements.length < 60) {
      console.log('Requirements length is less than 60, not updating')
      return
    }
    console.log(
      `Setting requirements for Verified Holder role (${requirements.length})...`
    )
    await expect504(
      role.update(env.VERIFIED_HOLDER_ROLE_ID, wallet.address, signer, {
        name: verifiedHolderRole.name,
        logic: 'OR',
        requirements,
      })
    )
  }
}
