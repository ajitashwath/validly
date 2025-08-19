import { type NextRequest, NextResponse } from "next/server"

type Provider = "openai" | "anthropic" | "cohere" | "gemini" | "llama"

interface ValidationRequest {
  provider: Provider
  apiKey: string
}

const providerConfigs = {
  openai: {
    url: "https://api.openai.com/v1/models",
    usageUrl: "https://api.openai.com/v1/usage",
    headers: (apiKey: string) => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
  },
  anthropic: {
    url: "https://api.anthropic.com/v1/models",
    headers: (apiKey: string) => ({
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    }),
  },
  cohere: {
    url: "https://api.cohere.ai/v1/models",
    headers: (apiKey: string) => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
  },
  gemini: {
    url: "https://generativelanguage.googleapis.com/v1/models",
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
    }),
    urlWithKey: (apiKey: string) => `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
  },
  llama: {
    url: "https://api.replicate.com/v1/models",
    headers: (apiKey: string) => ({
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    }),
  },
}

const generateMockTokenUsage = (provider: Provider) => {
  const baseUsage = {
    openai: { used: 45000, limit: 100000, requestsUsed: 1200, requestsLimit: 3000 },
    anthropic: { used: 25000, limit: 50000, requestsUsed: 800, requestsLimit: 2000 },
    cohere: { used: 15000, limit: 30000, requestsUsed: 500, requestsLimit: 1500 },
    gemini: { used: 35000, limit: 75000, requestsUsed: 900, requestsLimit: 2500 },
    llama: { used: 20000, limit: 40000, requestsUsed: 600, requestsLimit: 1800 },
  }

  const usage = baseUsage[provider]
  const resetDate = new Date()
  resetDate.setDate(resetDate.getDate() + (30 - resetDate.getDate()))

  return {
    ...usage,
    resetDate: resetDate.toISOString(),
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidationRequest = await request.json()
    const { provider, apiKey } = body

    if (!provider || !apiKey) {
      return NextResponse.json({ isValid: false, error: "Provider and API key are required" }, { status: 400 })
    }

    if (!apiKey.trim()) {
      return NextResponse.json({ isValid: false, error: "API key cannot be empty" }, { status: 400 })
    }

    if (!providerConfigs[provider]) {
      return NextResponse.json({ isValid: false, error: "Unsupported provider" }, { status: 400 })
    }

    const config = providerConfigs[provider]

    let validationUrl = config.url
    if (provider === "gemini" && "urlWithKey" in config) {
      validationUrl = config.urlWithKey(apiKey.trim())
    }

    const response = await fetch(validationUrl, {
      method: "GET",
      headers: config.headers(apiKey.trim()),
    })

    if (response.ok) {
      const tokenUsage = generateMockTokenUsage(provider)

      return NextResponse.json({
        isValid: true,
        tokenUsage,
      })
    } else {
      let errorMessage = "Invalid API key"

      if (response.status === 401) {
        errorMessage = "Invalid API key or insufficient permissions"
      } else if (response.status === 403) {
        errorMessage = "API key does not have required permissions"
      } else if (response.status === 429) {
        errorMessage = "Rate limit exceeded. Please try again later"
      } else if (response.status >= 500) {
        errorMessage = "Provider service temporarily unavailable"
      }

      return NextResponse.json(
        { isValid: false, error: errorMessage },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("Validation error:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        { isValid: false, error: "Network error. Please check your connection and try again" },
        { status: 200 },
      )
    }

    return NextResponse.json(
      { isValid: false, error: "An unexpected error occurred. Please try again" },
      { status: 500 },
    )
  }
}
