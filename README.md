# Recursive Site

A modern Next.js web application with AI-powered improvement suggestions.

## 🚀 Features

- **Next.js 15**: Built with the latest Next.js App Router for optimal performance
- **TypeScript**: Full type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **AI-Powered Improvements**: Automated suggestions via GitHub Actions using OpenAI GPT-4
- **Modern Stack**: Ready for scalability and future database integration

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

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Customization

The main page is located at `src/app/page.tsx`. The layout and global styles are in `src/app/layout.tsx` and `src/app/globals.css`.

## 🤖 AI-Powered Improvement System

This repository includes a GitHub Action that runs every hour to analyze the codebase and generate improvement suggestions using OpenAI's GPT-4 model. The action creates GitHub issues with specific, actionable recommendations for enhancing the repository.

### Setup Instructions

1. **Repository Secrets**
   - Add `OPENAI_API_KEY` to your GitHub repository secrets
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

2. **Repository Permissions**
   - Enable "Read and write permissions" for workflows
   - Allow GitHub Actions to create and approve pull requests

### How It Works

The workflow analyzes:
- Repository structure and file organization
- Configuration files (package.json, tsconfig.json, etc.)
- Code patterns and modern best practices
- Documentation and setup instructions

**Duplicate Prevention**: The system intelligently detects similar existing issues and prevents creation of duplicates based on:
- Content similarity analysis
- Time-based weighting (older issues have less impact)
- Topic extraction and comparison

Generated issues include:
- Specific improvement recommendations
- Code quality enhancements
- Performance optimizations
- Security considerations

## 🔧 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Linting**: ESLint with Next.js configuration
- **AI Integration**: OpenAI GPT-4 via GitHub Actions

## 📦 Future Enhancements

This foundation is ready for:
- Database integration (PostgreSQL, MongoDB, etc.)
- Authentication systems
- API routes and middleware
- Advanced UI components
- Testing frameworks

## 🚀 Deployment

Deploy easily on:
- [Vercel](https://vercel.com) (recommended)
- [Netlify](https://netlify.com)
- [Railway](https://railway.app)
- Any Node.js hosting platform

## 📄 License

This project is licensed under the ISC License.

---

*This repository demonstrates AI-powered self-improvement in a modern Next.js application. The very system that suggests improvements is also subject to its own recommendations!*
