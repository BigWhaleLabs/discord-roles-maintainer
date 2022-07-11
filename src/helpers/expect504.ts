export default async function (p: Promise<unknown>) {
  try {
    await p
  } catch (error) {
    if (error instanceof Error && error.message.includes('504')) {
      console.log('Request failed with 504, but it probably succeeded')
    } else {
      throw error
    }
  }
}
