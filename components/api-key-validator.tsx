"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle, XCircle, Eye, EyeOff, Zap, Database, Clock } from "lucide-react"

type Provider = "openai" | "anthropic" | "cohere" | "gemini" | "llama"

interface ValidationResult {
    isValid: boolean
    error?: string
    provider: Provider
    tokenUsage?: {
        used: number
        limit: number
        resetDate?: string
        requestsUsed?: number
        requestsLimit?: number
    }
}

const providerNames = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    cohere: "Cohere",
    gemini: "Google Gemini",
    llama: "Meta LLaMA",
}

const providerDescriptions = {
    openai: "GPT-4, GPT-3.5, DALL-E, Whisper",
    anthropic: "Claude 3.5 Sonnet, Claude 3 Opus",
    cohere: "Command R+, Embed, Rerank",
    gemini: "Gemini Pro, Gemini Flash",
    llama: "LLaMA 2, Code Llama",
}

export function ApiKeyValidator() {
    const [provider, setProvider] = useState<Provider>("openai")
    const [apiKey, setApiKey] = useState("")
    const [isValidating, setIsValidating] = useState(false)
    const [result, setResult] = useState<ValidationResult | null>(null)
    const [showKey, setShowKey] = useState(false)

    const validateApiKey = async () => {
        if (!apiKey.trim()) {
            setResult({
                isValid: false,
                error: "API key is required",
                provider,
            })
            return
        }

        setIsValidating(true)
        setResult(null)

        try {
            const response = await fetch("/api/validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    provider,
                    apiKey: apiKey.trim(),
                }),
            })

            const data = await response.json()

            setResult({
                isValid: data.isValid,
                error: data.error,
                provider,
                tokenUsage: data.tokenUsage,
            })
        } catch (error) {
            setResult({
                isValid: false,
                error: "Network error occurred. Please try again.",
                provider,
            })
        } finally {
            setIsValidating(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            validateApiKey()
        }
    }

    const getUsagePercentage = (used: number, limit: number) => {
        return Math.min((used / limit) * 100, 100)
    }

    return (
        <div className="space-y-6">
            <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle className="font-space-grotesk">Validly</CardTitle>
                    <CardDescription>Select your provider and enter your API key to validate it</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="provider">Provider</Label>
                        <Select value={provider} onValueChange={(value: Provider) => setProvider(value)}>
                            <SelectTrigger>
                                <SelectValue>
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">{providerNames[provider]}</span>
                                        <span className="text-xs text-muted-foreground">{providerDescriptions[provider]}</span>
                                    </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(providerNames).map(([key, name]) => (
                                    <SelectItem key={key} value={key}>
                                        <div className="flex flex-col items-start">
                                            <span className="font-medium">{name}</span>
                                            <span className="text-xs text-muted-foreground">{providerDescriptions[key as Provider]}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <div className="relative">
                            <Input
                                id="apiKey"
                                type={showKey ? "text" : "password"}
                                placeholder={`Enter your ${providerNames[provider]} API key`}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowKey(!showKey)}
                            >
                                {showKey ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="sr-only">{showKey ? "Hide" : "Show"} API key</span>
                            </Button>
                        </div>
                    </div>

                    <Button
                        onClick={validateApiKey}
                        disabled={isValidating || !apiKey.trim()}
                        className="w-full font-space-grotesk"
                    >
                        {isValidating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Validating...
                            </>
                        ) : (
                            "Validate API Key"
                        )}
                    </Button>

                    {result && (
                        <Alert className={result.isValid ? "border-primary bg-primary/5" : "border-destructive bg-destructive/5"}>
                            <div className="flex items-center gap-2">
                                {result.isValid ? (
                                    <CheckCircle className="h-4 w-4 flex-shrink-0 text-primary" />
                                ) : (
                                    <XCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
                                )}
                                <AlertDescription className="font-medium text-sm">
                                    {result.isValid ? (
                                        <span className="text-primary whitespace-nowrap">
                                            Valid - Your {providerNames[result.provider]} API key is working correctly
                                        </span>
                                    ) : (
                                        <span className="text-destructive whitespace-nowrap">Invalid - {result.error}</span>
                                    )}
                                </AlertDescription>
                            </div>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {result?.isValid && result.tokenUsage && (
                <Card className="w-full shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-space-grotesk flex items-center gap-2">
                            <Zap className="h-5 w-5 text-emerald-500" />
                            Token Usage Analytics
                        </CardTitle>
                        <CardDescription>
                            Current usage statistics for your {providerNames[result.provider]} account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Token Usage Progress */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Database className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Token Usage</span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {result.tokenUsage.used.toLocaleString()} / {result.tokenUsage.limit.toLocaleString()}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <Progress value={getUsagePercentage(result.tokenUsage.used, result.tokenUsage.limit)} className="h-3" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{getUsagePercentage(result.tokenUsage.used, result.tokenUsage.limit).toFixed(1)}% used</span>
                                    <span>{(result.tokenUsage.limit - result.tokenUsage.used).toLocaleString()} remaining</span>
                                </div>
                            </div>
                        </div>

                        {/* Request Usage Progress */}
                        {result.tokenUsage.requestsUsed && result.tokenUsage.requestsLimit && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">API Requests</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {result.tokenUsage.requestsUsed.toLocaleString()} /{" "}
                                        {result.tokenUsage.requestsLimit.toLocaleString()}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <Progress
                                        value={getUsagePercentage(result.tokenUsage.requestsUsed, result.tokenUsage.requestsLimit)}
                                        className="h-3"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>
                                            {getUsagePercentage(result.tokenUsage.requestsUsed, result.tokenUsage.requestsLimit).toFixed(1)}%
                                            used
                                        </span>
                                        <span>
                                            {(result.tokenUsage.requestsLimit - result.tokenUsage.requestsUsed).toLocaleString()} remaining
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Usage Statistics Grid */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="text-2xl font-bold text-emerald-600">
                                    {(((result.tokenUsage.limit - result.tokenUsage.used) / result.tokenUsage.limit) * 100).toFixed(0)}%
                                </div>
                                <div className="text-xs text-muted-foreground">Available</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="text-2xl font-bold text-slate-600">
                                    {result.tokenUsage.resetDate ? new Date(result.tokenUsage.resetDate).getDate() : "N/A"}
                                </div>
                                <div className="text-xs text-muted-foreground">Reset Day</div>
                            </div>
                        </div>

                        {result.tokenUsage.resetDate && (
                            <div className="text-xs text-center text-muted-foreground pt-2 border-t">
                                Usage resets on {new Date(result.tokenUsage.resetDate).toLocaleDateString()}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
