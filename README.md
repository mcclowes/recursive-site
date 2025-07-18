# AI Code Review Tool 🚀

**Transform boring code into brilliant code with AI-powered insights!**

An interactive Next.js application that provides instant code analysis, quality scoring, and improvement suggestions across multiple programming languages.

## 🎯 What Makes This Exciting?

Instead of just another generic starter project, this has been transformed into a **genuinely useful developer tool** that:

- ✨ **Instantly analyzes your code** and provides quality scores
- 💡 **Suggests improvements** with actionable recommendations
- 🎯 **Supports multiple languages** (JavaScript, TypeScript, Python, Java, C++, Go)
- 🔍 **Real-time feedback** as you type and analyze
- 📊 **Detailed metrics** including complexity, maintainability, and code statistics

## 🚀 Features

### 🔍 **Instant Code Analysis**

- Paste your code and get immediate quality scoring (0-100%)
- Real-time metrics: lines of code, complexity, maintainability rating
- Language-specific analysis rules and best practices

### 💡 **Smart Suggestions**

- Actionable improvement recommendations
- Warning, info, and success feedback types
- Line-by-line suggestions for better code quality

### 🎯 **Multi-Language Support**

- JavaScript & TypeScript analysis
- Python code review
- Java, C++, and Go support
- Language-specific best practices and patterns

### 🎨 **Modern UI/UX**

- Clean, professional interface
- Dark-themed code editor
- Responsive design for all devices
- Toast notifications for user feedback

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/mcclowes/recursive-site.git
   cd recursive-site
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to start analyzing code!

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎮 How to Use

1. **Select your programming language** from the dropdown
2. **Paste or type your code** into the editor
3. **Click "Analyze Code"** to get instant feedback
4. **Review suggestions** and improve your code quality
5. **Iterate and improve** with real-time analysis

## 🔧 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for modern UI
- **Components**: Custom React components
- **API**: Next.js API routes for code analysis
- **Notifications**: React Hot Toast for user feedback

## 🤖 AI Integration

The application includes powerful AI-enhanced code analysis:

### 🔧 **Rule-Based Analysis** (Always Available)

- Static code analysis with predefined rules
- Language-specific best practices checking
- Performance and maintainability scoring
- Security pattern detection

### 🚀 **AI-Powered Analysis** (Optional)

- Context-aware code suggestions using OpenAI GPT models
- Advanced code quality insights
- Personalized improvement recommendations
- Enhanced scoring with AI-generated feedback

### 🛠️ **Setting Up AI Integration**

1. **Get an OpenAI API key** from [OpenAI Platform](https://platform.openai.com/account/api-keys)

2. **Create environment file**

   ```bash
   cp .env.local.example .env.local
   ```

3. **Add your API key**

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Restart the development server**
   ```bash
   npm run dev
   ```

### 📊 **AI Features**

When AI is enabled, you'll get:

- **Context-aware suggestions** tailored to your specific code
- **Enhanced scoring** that combines rule-based and AI analysis
- **Categorized feedback** (performance, security, readability, best-practices)
- **AI indicator** showing when AI analysis is active
- **Graceful fallback** to rule-based analysis if AI is unavailable

### 🔐 **Security & Privacy**

- API keys are stored securely in environment variables
- Code is not stored or logged
- All analysis happens in real-time
- No data persistence or external sharing

## 📈 What's Next?

This foundation is ready for:

- Integration with OpenAI/Claude APIs for advanced AI analysis
- More programming languages and frameworks
- Code formatting and auto-fix suggestions
- Team collaboration features
- Performance benchmarking
- Security vulnerability detection

## 🚀 Deployment

Deploy easily on:

- [Vercel](https://vercel.com) (recommended)
- [Netlify](https://netlify.com)
- [Railway](https://railway.app)
- Any Node.js hosting platform

## 📄 License

This project is licensed under the ISC License.

---

**From Generic to Genius** - This repository demonstrates how to transform a boring starter project into an interactive, useful developer tool that people actually want to use! 🎉
