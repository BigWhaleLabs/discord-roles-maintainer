import 'module-alias/register'
import 'source-map-support/register'

import defaultProvider from '@/helpers/defaultProvider'
import getSCERC721Ledger from '@/helpers/getSCERC721Ledger'
import getSCEmailLedger from '@/helpers/getSCEmailLedger'

function startListeners() {
  const sCERC721Ledger = getSCERC721Ledger(defaultProvider)
  const sCEmailLedger = getSCEmailLedger(defaultProvider)
  sCERC721Ledger.on(
    sCERC721Ledger.filters.CreateDerivativeContract(),
    (originalContract, derivativeContract) => {
      // TODO: add ERC721 role
    }
  )
  sCEmailLedger.on(
    sCEmailLedger.filters.CreateDerivativeContract(),
    (email, derivativeContract) => {
      // TODO: add email role
    }
  )
}

void (() => {
  // TODO: fetch existing ledgers (see the code in `seal-cred-peek-frontend` for reference), and check against existing roles, adding the ones that haven't been added yet
  startListeners()
  console.log('App started!')
})()
