'use server'

import { SignupFormSchema } from './model'
import { createHash, randomUUID } from 'node:crypto'
import { createSession, deleteSession } from '@/shared/lib/session'
import { redirect } from 'next/navigation'
import { sql } from '@vercel/postgres'

export async function signup(_, formData) {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password')
  })

  if (validatedFields.error) {
    return {
      errors: validatedFields.error.flatten().fieldErrors
    }
  }

  const { name, email, password } = validatedFields.data

  const hashedPassword = createHash('sha256').update(password).digest('hex')

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id varchar(255) PRIMARY KEY, 
      name varchar(255), 
      email varchar(255) NOT NULL UNIQUE, 
      password varchar(255)
    )
  ;`

  await sql`
    INSERT INTO users (id, name, email, password)
    VALUES (${randomUUID()}, ${name}, ${email}, ${hashedPassword})
    ON CONFLICT (email) DO NOTHING
  ;`

  const {rows} = await sql`
    SELECT id, name, email 
    FROM users
    WHERE email = ${email}
    LIMIT 1
  ;`

  const [user] = rows

  if (!user) {
    return {
      message: 'An error occurred while creating your account.',
    }
  }

  await createSession(user.id)

  redirect('/')
}

export async function logout() {
  deleteSession()
  redirect('/signup')
}