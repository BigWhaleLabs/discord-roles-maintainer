import { Bytes } from 'ethers'
import wallet from '@/helpers/wallet'

export default function (signableMessage: string | Bytes) {
  return wallet.signMessage(signableMessage)
}
