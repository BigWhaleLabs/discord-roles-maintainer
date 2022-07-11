import removeZeroBytesFromString from '@/helpers/removeZeroBytesFromString'

export default function (name: string) {
  return removeZeroBytesFromString(name)
    .replace(' (derivative)', '')
    .replace(' email', '')
}
