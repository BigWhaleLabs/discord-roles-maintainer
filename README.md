# Discord roles maintainer

Listens to SealCred ledgers and adds new roles to the SealCred Guild and Discord server.

## Installation and local launch

1. Clone this repo: `git clone https://github.com/Borodutch/discord-roles-maintainer`
2. Create `.env` with the environment variables listed below
3. Run `yarn` in the root folder
4. Run `yarn start`

And you should be good to go! Feel free to fork and submit pull requests.

## Environment variables

| Variable                            | Description                                                         |
| ----------------------------------- | ------------------------------------------------------------------- |
| `VITE_ETH_NETWORK`                  | Ethereum network to use (defaults to @bwl/constants)                |
| `VITE_ETH_RPC`                      | Ethereum node RPC URI (defaults to @bwl/constants)                  |
| `SC_EMAIL_LEDGER_CONTRACT_ADDRESS`  | Address of the SCEmailLedger contract (defaults to @bwl/constants)  |
| `SC_ERC721_LEDGER_CONTRACT_ADDRESS` | Address of the SCERC721Ledger contract (defaults to @bwl/constants) |
