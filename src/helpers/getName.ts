import Network from '@/models/Network'

export default function (derivativeName: string, network: Network) {
  return `${derivativeName} owner (v0.2.4-${network})`
}
