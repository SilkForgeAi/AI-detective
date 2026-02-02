// Llama model client using Ollama API
// Supports local LLM inference with Llama models

export interface LlamaConfig {
  baseUrl?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

const defaultConfig: LlamaConfig = {
  baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  model: process.env.LLAMA_MODEL || 'llama3.2', // or llama3, llama2, etc.
  temperature: 0.7,
  maxTokens: 2000,
}

export class LlamaClient {
  private config: LlamaConfig

  constructor(config: LlamaConfig = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
          stream: false,
          options: {
            temperature: this.config.temperature,
            num_predict: this.config.maxTokens,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.response || ''
    } catch (error) {
      console.error('Llama generation error:', error)
      throw error
    }
  }

  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages.map(msg => ({
            role: msg.role === 'system' ? 'system' : msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          })),
          stream: false,
          options: {
            temperature: this.config.temperature,
            num_predict: this.config.maxTokens,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.message?.content || data.response || ''
    } catch (error) {
      console.error('Llama chat error:', error)
      throw error
    }
  }

  async checkAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: 'GET',
      })
      return response.ok
    } catch {
      return false
    }
  }
}

export const llamaClient = new LlamaClient()
