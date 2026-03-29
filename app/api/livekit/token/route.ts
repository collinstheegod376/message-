import { NextResponse } from 'next/server'

// LiveKit token generation endpoint
// In production, use the livekit-server-sdk to generate tokens
export async function POST(req: Request) {
  try {
    const { room_name, participant_name } = await req.json()

    if (!room_name || !participant_name) {
      return NextResponse.json(
        { error: 'Missing room_name or participant_name' },
        { status: 400 }
      )
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      // Return mock token for development
      return NextResponse.json({
        token: 'mock-livekit-token-for-development',
        url: process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://localhost:7880',
      })
    }

    // In production, generate real LiveKit token:
    // import { AccessToken } from 'livekit-server-sdk'
    // const at = new AccessToken(apiKey, apiSecret, { identity: participant_name })
    // at.addGrant({ roomJoin: true, room: room_name, canPublish: true, canSubscribe: true })
    // const token = at.toJwt()

    return NextResponse.json({
      token: 'generate-real-token-here',
      url: process.env.NEXT_PUBLIC_LIVEKIT_URL,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }
}
