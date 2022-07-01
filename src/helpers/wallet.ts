import { ethers } from 'ethers'
import env from '@/helpers/env'

export default new ethers.Wallet(env.WALLET_PRIVATE_KEY)
