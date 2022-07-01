import { role } from '@guildxyz/sdk'
import env from '@/helpers/env'
import signer from '@/helpers/signer'
import wallet from '@/helpers/wallet'

export default function (name: string, address: string) {
  return role.create(wallet.address, signer, {
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
}
