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

  await sql`CREATE TABLE IF NOT EXISTS users ( id varchar(255), name varchar(255), email varchar(255), password varchar(255));`

  // await sql`INSERT INTO users (id, name, email, password) SELECT id, name, email, password FROM (VALUES (${randomUUID()}, ${name}, ${email}, ${hashedPassword})) AS new_user(id, name, email, password) WHERE NOT EXIST (SELECT 1 FROM users WHERE email = new_user.email);`

  // TODO: add to DB
  const data = [{
    id: randomUUID(),
    name,
    email,
    password: hashedPassword,
  }]

  const [user] = data

  console.log(user)

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