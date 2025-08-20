# Validly

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14+-black?style=flat&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind-3.0+-38bdf8?style=flat&logo=tailwindcss" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat" alt="License"/>
</div>

<div align="center">
  <h3>🔐 Secure API Key Validation for LLM Providers</h3>
  <p>Validate your OpenAI, Anthropic, Cohere, Gemini, and Llama API keys securely without storing or logging them.</p>
</div>

## ✨ Features

- **🔒 Secure Validation**: API keys are never stored, logged, or persisted
- **🌍 Multi-Provider Support**: Works with 5 major LLM providers
- **📊 Real-Time Usage Data**: Get current token usage and limits (OpenAI & Gemini)
- **🌓 Dark/Light Mode**: Beautiful UI with theme switching
- **📱 Responsive Design**: Works perfectly on desktop and mobile
- **⚡ Fast & Reliable**: Built on Next.js for optimal performance
- **🛡️ Error Handling**: Comprehensive error messages and validation

## 🚀 Supported Providers

| Provider | Validation | Usage Data | Rate Limits |
|----------|------------|------------|-------------|
| **OpenAI** | ✅ | ✅ | ✅ |
| **Anthropic** | ✅ | ❌ | ❌ |
| **Cohere** | ✅ | ❌ | ❌ |
| **Gemini** | ✅ | ✅ | ✅ |
| **Llama (Replicate)** | ✅ | ❌ | ❌ |

## 🛠️ Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom CSS variables
- **Fonts**: Space Grotesk & DM Sans
- **Icons**: Lucide React
- **Theme**: Custom dark/light mode implementation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ajitashwath/validly.git
   cd validly
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
validly/
├── app/
│   ├── api/validate/route.ts    # API validation endpoint
│   ├── globals.css              # Global styles & CSS variables
│   ├── layout.tsx               # Root layout with theme provider
│   └── page.tsx                 # Main page component
├── components/
│   ├── api-key-validator.tsx    # Main validation component
│   ├── theme-provider.tsx       # Theme context provider
│   └── theme-toggle.tsx         # Dark/light mode toggle
└── public/                      # Static assets
```

## 🔧 API Reference

### POST `/api/validate`

Validates an API key for a specific provider.

**Request Body:**
```json
{
  "provider": "openai" | "anthropic" | "cohere" | "gemini" | "llama",
  "apiKey": "your-api-key-here"
}
```

**Success Response:**
```json
{
  "isValid": true,
  "tokenUsage": {
    "used": 1234,
    "limit": 10000,
    "requestsUsed": 45,
    "requestsLimit": 1000,
    "resetDate": "2024-02-01T00:00:00.000Z"
  },
  "hasRealTimeData": true
}
```

**Error Response:**
```json
{
  "isValid": false,
  "error": "Invalid API key or insufficient permissions"
}
```

## 🔒 Security Features
- **No Data Persistence**: API keys are only used for validation and immediately discarded
- **HTTPS Only**: All API calls use secure HTTPS connections
- **Error Sanitization**: Sensitive information is never exposed in error messages
- **Rate Limiting**: Built-in protection against abuse
- **Input Validation**: Comprehensive validation of all inputs

## 🐛 Troubleshooting

### Common Issues

**API Key Validation Fails**
- Ensure the API key is correct and has proper permissions
- Check if the provider's API is experiencing downtime
- Verify network connectivity

**Theme Not Working**
- Clear browser cache and cookies
- Check if JavaScript is enabled
- Ensure you're using a supported browser

**Build Errors**
- Run `npm run build` to check for TypeScript errors
- Ensure all dependencies are installed correctly
- Check Node.js version compatibility

## 🤝 Contributing
We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Use TypeScript for all new code
- Follow the existing code style and formatting
- Add comments for complex logic
- Test changes thoroughly before submitting

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Fonts: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) & [DM Sans](https://fonts.google.com/specimen/DM+Sans)

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/ajitashwath">@ajitashwath</a></p>
  <p>⭐ Star this repo if you find it useful!</p>
</div>
