import {
  ETH_NETWORK,
  ETH_RPC,
  SC_EMAIL_LEDGER_CONTRACT_ADDRESS,
  SC_ERC721_LEDGER_CONTRACT_ADDRESS,
} from '@big-whale-labs/constants'
import { cleanEnv, str } from 'envalid'

// eslint-disable-next-line node/no-process-env
export default cleanEnv(process.env, {
  VITE_ETH_NETWORK: str({ default: ETH_NETWORK }),
  VITE_ETH_RPC: str({ default: ETH_RPC }),
  VITE_SC_ERC721_LEDGER_CONTRACT_ADDRESS: str({
    default: SC_ERC721_LEDGER_CONTRACT_ADDRESS,
  }),
  VITE_SC_EMAIL_LEDGER_CONTRACT_ADDRESS: str({
    default: SC_EMAIL_LEDGER_CONTRACT_ADDRESS,
  }),
  VITE_GUILD_ID: str(),
  VITE_WALLET_PUBLIC_ADDRESS: str(),
  VITE_WALLET_PRIVATE_KEY: str(),
})
