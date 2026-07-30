export function SiteFooter() {
  return (
    <footer className="border-t py-6">
      <div className="mx-auto max-w-5xl px-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} StarterKit. All rights reserved.
      </div>
    </footer>
  )
}
