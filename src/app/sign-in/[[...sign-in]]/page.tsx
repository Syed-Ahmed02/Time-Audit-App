import { createUser } from '@/app/actions'
import { SignIn } from '@clerk/nextjs'

export default async function Page() {
  // //Create user in the database
  // await createUser()

  return <SignIn />
}