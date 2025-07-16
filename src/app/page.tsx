export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-6">
            🤖 Recursive Site
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            A NextJS web application with AI-powered improvement suggestions
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              Welcome to Your AI-Enhanced Site
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This site automatically analyzes itself and creates improvement suggestions using AI. 
              It&apos;s built with Next.js, TypeScript, and Tailwind CSS for a modern, scalable foundation.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  🚀 Modern Stack
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Built with Next.js 15, TypeScript, and Tailwind CSS for optimal performance and developer experience.
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  🤖 AI-Powered
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Automated improvement suggestions powered by OpenAI GPT-4 to continuously enhance your site.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Next.js Docs
            </a>
            <a
              href="https://tailwindcss.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Tailwind CSS
            </a>
            <a
              href="https://www.typescriptlang.org/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              TypeScript
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
