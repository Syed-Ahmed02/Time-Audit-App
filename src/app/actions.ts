'use server'

import { auth } from '@clerk/nextjs/server'
import { timeBlock, usersTable } from '@/db/schema'
import { db } from '@/db'
import { eq } from 'drizzle-orm'
import { TimeBlockData,TimeBlockProps } from '@/components/time-block'
import { currentUser } from '@clerk/nextjs/server'

//This wont work,need to use clerk webhooks to sync data with neon

export async function createUser() {
  const user = await currentUser()
  if(!user){
    return
  }
  await db.insert(usersTable).values({
    id:user.id,
    name:user.fullName || '',
    email:user.emailAddresses[0].emailAddress || '',
  })
  
}