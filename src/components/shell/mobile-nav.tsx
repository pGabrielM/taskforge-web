'use client'

import { Menu } from 'lucide-react'
import { useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Logo } from '@/components/logo'
import { SidebarNav } from './sidebar-nav'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        className="rounded-md border-2 border-zinc-900 bg-white p-1.5 text-zinc-900 lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-zinc-950/40" />
        <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 w-72 border-r-2 border-zinc-900 bg-zinc-50 p-4 focus:outline-none">
          <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Navegação</DialogPrimitive.Description>
          <div className="mb-6 px-2">
            <Logo />
          </div>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
