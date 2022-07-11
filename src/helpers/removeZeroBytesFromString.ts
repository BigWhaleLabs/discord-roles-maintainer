import { utils } from 'ethers'

export default function (str: string) {
  let result = ''
  for (let i = 0; i < str.length; i++) {
    try {
      const byte = utils.toUtf8Bytes(str[i])[0]
      if (byte) {
        result = result + str[i]
      }
    } catch (error) {
      console.log(error instanceof Error ? error.message : error)
    }
  }
  return result
}
