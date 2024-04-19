import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { kv } from '@vercel/kv'

const SEVEN_DAYS_IN_MILISECONDS = 7 * 24 * 60 * 60 * 1000
 
const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)
 
export async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}
 
export async function decrypt(token) {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    console.log('Failed to verify session')
  }
}

function getSession() {
  return cookies().get('session')?.value
}

export async function createSession(userId) {
  const expiresAt = new Date(Date.now() + SEVEN_DAYS_IN_MILISECONDS)
  const sessionId = crypto.randomUUID()

  const token = await encrypt({ id: sessionId, expiresAt })

  await kv.set(`sessions-${userId}-${sessionId}`, {
    token
  })

  cookies().set('session', token, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function updateSession() {
  const token = getSession()
  const payload = await decrypt(token)

  if (!token || !payload) return null

  const expires = new Date(Date.now() + SEVEN_DAYS_IN_MILISECONDS)
  cookies().set('session', token, {
    httpOnly: true,
    secure: true,
    expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  cookies().delete('session')
}