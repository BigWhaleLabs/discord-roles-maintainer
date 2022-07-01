import { role } from '@guildxyz/sdk'
import env from '@/helpers/env'
import signer from '@/helpers/signer'
import wallet from '@/helpers/wallet'

export default async function (name: string, address: string) {
  console.log(`Creating guild role ${name}...`)
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
  // TODO: Update verified holders
  // await role.update(env.VERIFIED_HOLDER_ROLE_ID, wallet.address, signer, {

  // })
}
