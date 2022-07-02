import * as dotenv from 'dotenv'
import {
  ETH_NETWORK,
  ETH_RPC,
  SC_EMAIL_LEDGER_CONTRACT_ADDRESS,
  SC_ERC721_LEDGER_CONTRACT_ADDRESS,
} from '@big-whale-labs/constants'
import { cleanEnv, num, str } from 'envalid'
import { cwd } from 'process'
import { resolve } from 'path'

dotenv.config({ path: resolve(cwd(), '.env') })

// eslint-disable-next-line node/no-process-env
export default cleanEnv(process.env, {
  ETH_NETWORK: str({ default: ETH_NETWORK }),
  ETH_RPC: str({ default: ETH_RPC }),
  SC_ERC721_LEDGER_CONTRACT_ADDRESS: str({
    default: SC_ERC721_LEDGER_CONTRACT_ADDRESS,
  }),
  SC_EMAIL_LEDGER_CONTRACT_ADDRESS: str({
    default: SC_EMAIL_LEDGER_CONTRACT_ADDRESS,
  }),
  GUILD_ID: num(),
  DISCORD_SERVER_ID: str(),
  WALLET_PRIVATE_KEY: str(),
  VERIFIED_HOLDER_ROLE_ID: num(),
})
