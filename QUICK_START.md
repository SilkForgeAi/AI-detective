Quick Start Guide - Get AI Detective Running in 2 Minutes

Easiest Way: Use the Automated Script

Mac/Linux:
./quick-start.sh

Windows:
quick-start.bat

The script does everything automatically! Just run it and you're ready.

Manual Setup (if you prefer)

Step 1: Clone the Repository

git clone https://github.com/SilkForgeAi/AI-detective.git
cd AI-detective

Step 2: Install Dependencies

npm install

Step 3: Set Up Environment (Optional but Recommended)

Create a .env.local file in the project root:

USE_LLAMA=true
OLLAMA_BASE_URL=http://localhost:11434
LLAMA_MODEL=llama3.2

If you don't have Ollama, you can use OpenAI instead (add your API key):
OPENAI_API_KEY=your_key_here

Step 4: Start Ollama (If Using Local AI)

Check if Ollama is installed:
ollama --version

If not installed, download from: https://ollama.ai

Start Ollama:
ollama serve

Pull the model:
ollama pull llama3.2

Step 5: Start the Development Server

npm run dev

Step 6: Open Your Browser

Go to: http://localhost:3000

That's it! You're ready to explore cases.

Quick Test

1. Click "Fetch Public Case" on the homepage
2. Try "Zodiac Killer" or any other case
3. Click "Run Analysis" to see AI reasoning in action
4. Explore the 3D globe, timeline, and patterns

Troubleshooting

Ollama not working?
- Make sure Ollama is running: ollama serve
- Check if model is installed: ollama list
- Test connection: curl http://localhost:11434/api/tags

Port 3000 already in use?
- Use a different port: npm run dev -- -p 3001

Database errors?
- Delete ai-detective.db and restart (it will recreate)

Need Help?

See README.md for full documentation
See SETUP_OLLAMA.md for detailed Ollama setup
See DISCLAIMER.md for important usage guidelines
