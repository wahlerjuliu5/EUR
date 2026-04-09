import Link from "next/link"
import { Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/app/actions/auth"

export async function Nav() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-1.5 text-xl font-bold">
          <Zap className="size-5 fill-blue-500 text-blue-500" />
          FixItNow
        </Link>

        <nav className="flex items-center gap-5">
          {user ? (
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign out
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-8 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Sign up free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
