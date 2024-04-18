'use server'

import { SignupFormSchema } from './model'
import { createHash } from 'node:crypto'

const hash = createHash('sha256')

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

  const hashedPassword = hash.update(password).digest('hex')

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
}