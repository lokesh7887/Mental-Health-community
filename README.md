# MindSpace - Mental Health Support Platform

A privacy-first mental health support web application built with Next.js, featuring AI-powered emotional support and community features.

## 🌟 Features

- **AI Emotional Support**: Enhanced with DeepSeek R1 for empathetic conversations
- **Anonymous Community**: Safe space for sharing experiences and support
- **Privacy-First**: Complete anonymity and data protection
- **Mood Analysis**: Real-time emotional state tracking
- **Wellness Suggestions**: Personalized coping strategies

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- OpenRouter API key for AI features

### Installation

1. **Clone and install**
   \`\`\`bash
   git clone <repository-url>
   cd mindspace-app
   npm install
   \`\`\`

2. **Set up environment**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. **Validate environment**
   \`\`\`bash
   npm run env:check
   \`\`\`

4. **Seed database (optional)**
   \`\`\`bash
   npm run db:seed
   \`\`\`

5. **Start development**
   \`\`\`bash
   npm run dev
   \`\`\`

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ | Secret key for JWT tokens (32+ chars) |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `OPENROUTER_API_KEY` | ✅ | OpenRouter API key for AI features |
| `ALLOWED_ORIGINS` | ⚠️ | CORS allowed origins |

## 🏗️ Architecture

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **AI**: DeepSeek R1 via OpenRouter API
- **Authentication**: JWT with bcrypt

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run env:check` - Validate environment variables
- `npm run db:seed` - Seed database with sample data

## 🔒 Security

- Anonymous usernames and encrypted passwords
- JWT authentication with secure tokens
- CORS protection and security headers
- Input validation and sanitization

## 📄 License

MIT License - see LICENSE file for details.

---

**Remember**: This platform provides peer support, not professional medical advice.
\`\`\`

```typescriptreact file="src/server.js" isDeleted="true"
...deleted...
