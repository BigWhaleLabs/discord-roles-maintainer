export default function (name: string) {
  return name
    .replace(/\0/g, '')
    .replace(' (derivative)', '')
    .replace(' email', '')
}
