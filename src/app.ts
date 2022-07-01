import 'module-alias/register'
import 'source-map-support/register'

import { Bytes, ethers } from 'ethers'
import { role } from '@guildxyz/sdk'
import defaultProvider from '@/helpers/defaultProvider'
import env from 'helpers/env'
import getSCERC721Ledger from '@/helpers/getSCERC721Ledger'
import getSCEmailLedger from '@/helpers/getSCEmailLedger'

/*
1. User generates a derivative nft
2. NFT-d registers into our system
3. NFT-d is created on guild
4. User now has a discord role with that
 */

function startListeners() {
  const sCERC721Ledger = getSCERC721Ledger(defaultProvider)
  const sCEmailLedger = getSCEmailLedger(defaultProvider)

  const wallet = new ethers.Wallet(env.VITE_WALLET_PRIVATE_KEY)
  const sign = (signableMessage: string | Bytes) =>
    wallet.signMessage(signableMessage)

  sCERC721Ledger.on(
    sCERC721Ledger.filters.CreateDerivativeContract(),
    async (originalContract, derivativeContract) => {
      await role.create(env.VITE_WALLET_PUBLIC_ADDRESS, sign, {
        guildId: parseInt(env.VITE_GUILD_ID),
        name: derivativeContract.tokenName + '-D',
        logic: 'AND',
        requirements: [
          {
            type: 'ERC721',
            chain: 'GOERLI',
            address: derivativeContract.address,
            data: {
              amount: 1,
            },
          },
        ],
      })
    }
  )
  sCEmailLedger.on(
    sCEmailLedger.filters.CreateDerivativeContract(),
    async (email, derivativeContract) => {
      await role.create(env.VITE_WALLET_PUBLIC_ADDRESS, sign, {
        guildId: parseInt(env.VITE_GUILD_ID),
        name: email + '-D',
        logic: 'AND',
        requirements: [
          {
            type: 'ERC721',
            chain: 'GOERLI',
            address: derivativeContract.address,
            data: {
              amount: 1,
            },
          },
        ],
      })
    }
  )
}

void (() => {
  // TODO: fetch existing ledgers (see the code in `seal-cred-peek-frontend` for reference), and check against existing roles, adding the ones that haven't been added yet
  startListeners()
  console.log('App started!')
})()
