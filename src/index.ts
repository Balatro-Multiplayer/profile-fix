import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {compress, decompress, fixCorruption} from './loading.js'
const app = new Hono()
app.use('*',cors())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
app.post('/fix', async (c) => {
  const {file} = await c.req.parseBody()
  // safety check
  if (!file || !(file instanceof File)) {
    return c.text('no file uploaded', 400)
  }
  try {
    // convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // do your decompression
    const decompressedData = decompress(arrayBuffer)
    const fixed = fixCorruption(decompressedData)
    const compressedData = compress(fixed)
    console.log(fixed)
    // send it back to client
    return new Response(compressedData, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file.name}"`
      }
    })
  } catch (error) {
    console.error('decompression failed:', error)
    return c.text('failed to process file: ' + error.message, 500)
  }
})
export default {
  port: 3456,
  fetch: app.fetch,
}
