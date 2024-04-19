'use server'

import { SignupFormSchema } from './model'
import { createHash } from 'node:crypto'
import { createSession } from '@/shared/lib/session'
import { redirect } from 'next/navigation'

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

  // TODO: add to DB
  const data = [{
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

  // TODO: change to user.id
  await createSession(user.name)

  redirect('/')
}