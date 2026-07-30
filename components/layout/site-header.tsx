import Link from "next/link"

import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          StarterKit
        </Link>
        <div className="flex items-center gap-2">
          <MainNav />
          <ModeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
