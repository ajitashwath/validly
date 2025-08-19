import { ApiKeyValidator } from "@/components/api-key-validator"
import { ThemeToggle } from "@/components/theme-toggle"
import { Shield, Github } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold font-space-grotesk">Validly</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-space-grotesk mb-4">Validate Your API Keys</h2>
            <p className="text-muted-foreground text-lg">
              Securely test the validity of your LLM API keys for OpenAI, Anthropic, and Cohere. Keys are never stored
              or logged.
            </p>
          </div>

          <ApiKeyValidator />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Keys are never stored or logged. Validation happens securely through API calls.</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Github className="h-4 w-4" />
              <a
                href="https://github.com/ajitashwath/api-validator"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
