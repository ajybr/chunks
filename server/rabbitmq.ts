import amqp, { type Channel, type ChannelModel } from "amqplib"
import { env } from "@/lib/env"

export const QUEUES = {
  CHUNK_UPLOADED:      "chunk.uploaded",
  FILE_ASSEMBLED:      "file.assembled",
  FILE_SCAN:           "file.scan",
  THUMBNAIL_GENERATE:  "thumbnail.generate",
} as const

export type QueueName = typeof QUEUES[keyof typeof QUEUES]

export type ChunkUploadedPayload = {
  node_id:      string
  chunk_id:     string
  sequence:     number
  total_chunks: number
  owner:        string
}

export type FileAssembledPayload = {
  node_id:  string
  owner:    string
  mime_type: string
}

let connection: ChannelModel | null = null
let channel:    Channel    | null = null

async function getChannel(): Promise<Channel> {
  if (channel) return channel

  connection = await amqp.connect(env.RABBITMQ_URL)
  channel    = await connection.createChannel()

  // Assert all queues
  for (const queue of Object.values(QUEUES)) {
    await channel.assertQueue(queue, { durable: true })
  }

  // Reconnect on unexpected close
  connection.on("close", () => {
    connection = null
    channel = null
  })
  connection.on("error", (err) => {
    console.error("[rabbitmq] Connection error:", err)
    connection = null
    channel = null
  })

  return channel
}

export async function publish<T extends object>(queue: QueueName, payload: T): Promise<void> {
  const ch = await getChannel()
  const sent = ch.sendToQueue(
    queue,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true }
  )
  if (!sent) {
    console.warn(`[rabbitmq] Channel buffer full, message to ${queue} may be dropped`)
  }
}

export async function consume<T extends object>(
  queue: QueueName,
  handler: (payload: T) => Promise<void>
): Promise<void> {
  const ch = await getChannel()
  await ch.consume(queue, async (msg) => {
    if (!msg) return
    try {
      const payload = JSON.parse(msg.content.toString()) as T
      await handler(payload)
      ch.ack(msg)
    } catch (err) {
      console.error(`[${queue}] Handler failed:`, err)
      ch.nack(msg, false, false)  // dead-letter, don't requeue infinitely
    }
  })
}