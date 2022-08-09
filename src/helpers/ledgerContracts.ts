import { Ledger__factory } from '@big-whale-labs/seal-cred-ledger-contract'
import defaultProvider from '@/helpers/defaultProvider'
import ledgerAddresses from '@/helpers/ledgerAddresses'

function getLedgerContract(address: string) {
  return Ledger__factory.connect(address, defaultProvider)
}

export default ledgerAddresses.map((address) => getLedgerContract(address))
