'use client'

import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const session = useSession()

  return (
    <header className="bg-gray-900 text-white py-4 px-6 flex justify-between">
      <h1 className="text-2xl font-bold"><Link href={'/'}>Taskforge</Link></h1>
      <div className="flex gap-2">
        <div className="text-center ">
          <p className="text-sm">{session.data?.user.name}</p>
          <p className="text-sm">{session.data?.user.email}</p>
        </div>
        {session.status == 'authenticated' ?
          <Button variant="secondary" onClick={() => signOut({ callbackUrl: '/' })}>Leave</Button>
          :
          <Button variant="secondary" onClick={() => signIn()}>Login</Button>
        }
      </div >
    </header >
  )
}
