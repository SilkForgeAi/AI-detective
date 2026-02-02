import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { llamaClient } from '@/lib/llm/llamaClient'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    // Optional: Get user if logged in, but not required
    const session = await getSession(request)
    // Chat is available to everyone, no auth required

    const { message, conversationHistory, currentCase, allCases } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Build context-aware system prompt
    let systemPrompt = `You are an AI Detective Assistant, an expert in cold case investigations, forensic analysis, and criminal investigation. You help investigators solve cases by:

1. Analyzing case details and evidence
2. Identifying patterns and connections
3. Generating hypotheses and leads
4. Answering questions about cases
5. Providing investigative insights

You are professional, thorough, and ethical. Always emphasize that your suggestions are investigative leads requiring human verification, not definitive conclusions.

Guidelines:
- Be concise but thorough
- Cite specific evidence when making claims
- Suggest actionable next steps
- Acknowledge limitations and uncertainties
- Maintain sensitivity when discussing violent crimes
- Focus on facts and evidence-based reasoning`

    // Add case context if available
    if (currentCase) {
      systemPrompt += `\n\nCURRENT CASE CONTEXT:
- Case ID: ${currentCase.id}
- Title: ${currentCase.title}
- Status: ${currentCase.status}
- Description: ${currentCase.description}
- Evidence Items: ${currentCase.evidence.length}
${currentCase.evidence.map((e: any, i: number) => `  ${i + 1}. ${e.type}: ${e.description}`).join('\n')}

You can reference this case when answering questions.`
    }

    // Add all cases context for pattern recognition
    if (allCases && allCases.length > 0) {
      systemPrompt += `\n\nAVAILABLE CASES (${allCases.length} total):
${allCases.slice(0, 10).map((c: any) => `- ${c.title} (${c.status})`).join('\n')}
${allCases.length > 10 ? `... and ${allCases.length - 10} more cases` : ''}

You can reference these cases when discussing patterns or connections.`
    }

    // Build conversation history
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ]

    // Try Ollama first (if configured), then OpenAI, then fallback
    const useLlama = process.env.USE_LLAMA === 'true' || !process.env.OPENAI_API_KEY
    let response = ''

    if (useLlama) {
      try {
        const isAvailable = await llamaClient.checkAvailability()
        if (isAvailable) {
          console.log('Using Ollama for chat response')
          // Use chat method for better conversation handling
          response = await llamaClient.chat(messages)
          if (!response || response.trim().length === 0) {
            throw new Error('Empty response from Ollama')
          }
        } else {
          console.warn('Ollama not available, checking OpenAI fallback')
          throw new Error('Ollama not available')
        }
      } catch (error) {
        console.warn('Ollama error:', error)
        // Fallback to OpenAI only if API key is set
        if (process.env.OPENAI_API_KEY) {
          try {
            console.log('Falling back to OpenAI')
            const completion = await openai.chat.completions.create({
              model: 'gpt-3.5-turbo',
              messages: messages as any,
              temperature: 0.7,
              max_tokens: 1000,
            })
            response = completion.choices[0]?.message?.content || ''
          } catch (openaiError) {
            console.error('OpenAI error:', openaiError)
            response = '' // Will use fallback response
          }
        } else {
          console.error('No LLM available - Ollama not running and no OpenAI key')
          response = '' // Will use fallback response
        }
      }
    } else if (process.env.OPENAI_API_KEY) {
      // Use OpenAI directly
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: messages as any,
          temperature: 0.7,
          max_tokens: 1000,
        })
        response = completion.choices[0]?.message?.content || ''
      } catch (error) {
        console.error('OpenAI error:', error)
        response = '' // Will use fallback response
      }
    }

    // Fallback response if no LLM is available
    if (!response || response.trim().length === 0) {
      // Provide a helpful fallback response
      response = `I understand you're asking about "${message}". 

To enable full AI responses, please configure one of the following:
1. **Ollama (Local)**: Install Ollama and set USE_LLAMA=true in your .env file
2. **OpenAI**: Set OPENAI_API_KEY in your .env file

For now, I can help you with basic case information. Based on the case context provided, I can see this is about the "${currentCase?.title || 'selected case'}". 

Would you like me to help you analyze specific aspects of this case once AI is configured?`
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
