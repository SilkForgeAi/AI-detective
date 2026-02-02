# Setting Up Ollama for AI Detective

## Quick Setup

1. **Check if Ollama is installed:**
   ```bash
   ollama --version
   ```

2. **Start Ollama** (if not running):
   ```bash
   ollama serve
   ```
   Or just run `ollama` - it should start automatically.

3. **Pull a model:**
   ```bash
   ollama pull llama3.2
   ```
   
   Other good options:
   - `ollama pull llama3.1` (larger, better quality)
   - `ollama pull mistral` (fast, efficient)
   - `ollama pull codellama` (if you want code analysis)

4. **Create `.env.local` file** in the project root:
   ```bash
   USE_LLAMA=true
   OLLAMA_BASE_URL=http://localhost:11434
   LLAMA_MODEL=llama3.2
   ```

5. **Restart your dev server:**
   ```bash
   npm run dev
   ```

## Verify Setup

Test if Ollama is working:
```bash
curl http://localhost:11434/api/tags
```

You should see your installed models listed.

## Troubleshooting

**Ollama not responding:**
- Make sure Ollama is running: `ollama serve`
- Check if port 11434 is available
- Try: `ollama list` to see installed models

**Model not found:**
- Pull the model: `ollama pull llama3.2`
- Check available models: `ollama list`

**Connection refused:**
- Start Ollama: `ollama serve`
- Or restart Ollama service

## Default Behavior

The app will:
1. **Try Ollama first** (if configured or no OpenAI key)
2. **Fallback to OpenAI** (if API key is set and Ollama fails)
3. **Show helpful message** (if neither is available)

You don't need an OpenAI API key if you're using Ollama!
