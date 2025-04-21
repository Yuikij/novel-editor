import Link from "next/link"
import { LogoIcon } from "@/app/components/ui/icons"
import { Button } from "@/app/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center gap-2 font-bold">
            <LogoIcon className="h-6 w-6" />
            <span>NovelAI</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-4">
              <Link
                href="/features"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Pricing
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Login
              </Link>
              <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="space-y-3">
                <h1 className="bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text text-4xl font-bold tracking-tighter text-transparent sm:text-5xl md:text-6xl">
                  Craft Your Novel with AI Assistant
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Transform your writing process with our AI-powered novel editor. Develop characters, build worlds, and write engaging stories.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/dashboard">Get Started</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/demo">Watch Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full bg-muted py-12 md:py-24 lg:py-32">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Features That Elevate Your Writing
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Our AI-powered platform includes tools for character development, world-building, and narrative flow analysis.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border bg-card p-6 shadow">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Character Management</h3>
                <p className="text-muted-foreground">
                  Create detailed character profiles with AI-generated suggestions for personalities and backgrounds.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6 shadow">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Plot Analysis</h3>
                <p className="text-muted-foreground">
                  Analyze your story's pacing, emotional arcs, and narrative structure with AI-powered insights.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6 shadow">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary"
                  >
                    <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
                    <path d="M12 8v4l2 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">World Building</h3>
                <p className="text-muted-foreground">
                  Develop rich, consistent worlds with AI suggestions that enhance your creative vision.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-6 shadow">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Rhythm Analysis</h3>
                <p className="text-muted-foreground">
                  Improve the flow and pacing of your story with detailed rhythm and emotional analysis.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-background py-6 md:py-10">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-bold">
            <LogoIcon className="h-5 w-5" />
            <span>NovelAI</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            © 2023 NovelAI. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
} 