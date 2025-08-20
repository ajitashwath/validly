import { type NextRequest, NextResponse } from "next/server"

type Provider = "openai" | "anthropic" | "cohere" | "gemini" | "llama"

interface ValidationRequest {
  provider: Provider
  apiKey: string
}

interface TokenUsage {
  used: number
  limit: number
  requestsUsed?: number
  requestsLimit?: number
  resetDate?: string
}

const providerConfigs = {
  openai: {
    url: "https://api.openai.com/v1/models",
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

const getOpenAIUsage = async (apiKey: string): Promise<TokenUsage | null> => {
  try {
    const subscriptionResponse = await fetch("https://api.openai.com/v1/dashboard/billing/subscription", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!subscriptionResponse.ok) {
      console.error("Failed to get OpenAI subscription info:", subscriptionResponse.status)
      return null
    }

    const subscriptionData = await subscriptionResponse.json()
    
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    const usageResponse = await fetch(
      `https://api.openai.com/v1/dashboard/billing/usage?start_date=${startDateStr}&end_date=${endDateStr}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!usageResponse.ok) {
      console.error("Failed to get OpenAI usage data:", usageResponse.status)
      return null
    }

    const usageData = await usageResponse.json()

    // Calculate total usage in cents and convert to tokens (approximate)
    const totalAmountCents = usageData.total_usage || 0
    
    // Rough conversion: $0.002 per 1K tokens for GPT-3.5, so 1 cent = ~500 tokens
    const estimatedTokensUsed = Math.floor(totalAmountCents * 500)
    
    // Get limits from subscription data
    const hardLimitUsd = subscriptionData.hard_limit_usd || 100
    const tokenLimit = Math.floor(hardLimitUsd * 100 * 500) // Convert USD to tokens
    
    // Calculate reset date (next month)
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    resetDate.setHours(0, 0, 0, 0)

    return {
      used: estimatedTokensUsed,
      limit: tokenLimit,
      requestsUsed: usageData.daily_costs?.length || 0,
      requestsLimit: Math.floor(tokenLimit / 100), // Rough estimate
      resetDate: resetDate.toISOString(),
    }

  } catch (error) {
    console.error("Error checking OpenAI usage:", error)
    return null
  }
}

const getGeminiUsage = async (apiKey: string): Promise<TokenUsage | null> => {
  try {
    const testUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    const testResponse = await fetch(testUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: "Hi" }]
        }],
        generationConfig: {
          maxOutputTokens: 1,
          temperature: 0
        }
      }),
    })

    if (!testResponse.ok) {
      console.error("Gemini test request failed:", testResponse.status)
      return null
    }

    const rateLimitRemaining = testResponse.headers.get('x-ratelimit-remaining-requests')
    const rateLimitLimit = testResponse.headers.get('x-ratelimit-limit-requests')
    const rateLimitReset = testResponse.headers.get('x-ratelimit-reset-requests')
    
    const tokenLimitRemaining = testResponse.headers.get('x-ratelimit-remaining-tokens')
    const tokenLimitTotal = testResponse.headers.get('x-ratelimit-limit-tokens')

    let requestsUsed = 0
    let requestsLimit = 1500
    let tokensUsed = 0
    let tokensLimit = 15000

    if (rateLimitLimit && rateLimitRemaining) {
      requestsLimit = parseInt(rateLimitLimit)
      requestsUsed = requestsLimit - parseInt(rateLimitRemaining)
    }

    if (tokenLimitTotal && tokenLimitRemaining) {
      tokensLimit = parseInt(tokenLimitTotal)
      tokensUsed = tokensLimit - parseInt(tokenLimitRemaining)
    }
    let resetDate = new Date()
    
    if (rateLimitReset) {
      const resetSeconds = parseInt(rateLimitReset)
      if (resetSeconds > 1000000000) {
        resetDate = new Date(resetSeconds * 1000)
      } else { // Relative seconds
        resetDate = new Date(Date.now() + (resetSeconds * 1000))
      }
    } else {
      if (tokensLimit <= 15000) {
        resetDate.setDate(resetDate.getDate() + 1)
        resetDate.setHours(0, 0, 0, 0)
      } else {
        // Paid tier - monthly reset
        resetDate.setMonth(resetDate.getMonth() + 1)
        resetDate.setDate(1)
        resetDate.setHours(0, 0, 0, 0)
      }
    }

    return {
      used: tokensUsed,
      limit: tokensLimit,
      requestsUsed: Math.max(0, requestsUsed),
      requestsLimit: requestsLimit,
      resetDate: resetDate.toISOString(),
    }

  } catch (error) {
    console.error("Error checking Gemini usage:", error)
    return null
  }
}

const getRealTimeUsage = async (provider: Provider, apiKey: string): Promise<TokenUsage | null> => {
  switch (provider) {
    case "openai":
      return await getOpenAIUsage(apiKey)
    case "gemini":
      return await getGeminiUsage(apiKey)
    case "anthropic":
    case "cohere":
    case "llama":
      return null
    default:
      return null
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
      const tokenUsage = await getRealTimeUsage(provider, apiKey.trim())

      return NextResponse.json({
        isValid: true,
        tokenUsage: tokenUsage,
        hasRealTimeData: tokenUsage !== null,
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