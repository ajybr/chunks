import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Cloudy, HardDrive, Shield, Share2 } from "lucide-react"

const features = [
  {
    icon: HardDrive,
    title: "Content-Addressable Storage",
    description:
      "Files are split into chunks and deduplicated by hash. Identical content is stored once, saving space across uploads.",
  },
  {
    icon: Shield,
    title: "Encrypted at Rest",
    description:
      "All chunks are encrypted before they reach storage. Your data stays private, even from the infrastructure.",
  },
  {
    icon: Share2,
    title: "Link-Based Sharing",
    description:
      "Generate share links for individual files or folders. Control access with expiration dates and permissions.",
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium">
          <Cloudy className="size-5" />
          <span className="font-semibold tracking-tight">chunks</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/home">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/home">
            <Button size="sm">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="flex flex-col items-center px-6 py-24 text-center sm:px-10 sm:py-32">
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Your files, broken into pieces
          </h1>
          <p className="mt-4 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            chunks is a distributed file storage service that splits your files
            into encrypted chunks, deduplicates by content, and stores them
            across a scalable backend.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link href="/home">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/home">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
        </section>

        <section className="border-t px-6 py-24 sm:px-10 sm:py-32">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-3 rounded-xl border p-6"
              >
                <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                  <feature.icon className="size-5 text-foreground" />
                </div>
                <h3 className="text-balance text-base font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-6 sm:px-10">
        <p className="text-center text-xs text-muted-foreground">
          chunks &mdash; distributed file storage
        </p>
      </footer>
    </div>
  )
}
