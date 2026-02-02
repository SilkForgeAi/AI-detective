import { NextRequest, NextResponse } from 'next/server'
import { llamaClient } from '@/lib/llm/llamaClient'
import OpenAI from 'openai'
import { caseRepository } from '@/lib/db/caseRepository'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { query, caseIds } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Get relevant cases
    const allCases = caseIds && caseIds.length > 0
      ? await Promise.all(caseIds.map((id: string) => caseRepository.getById(id)))
      : await caseRepository.getAll()

    const validCases = allCases.filter(Boolean)

    // Build context
    const context = validCases.map(c => ({
      id: c!.id,
      title: c!.title,
      date: c!.date,
      description: c!.description.substring(0, 200),
      evidence: c!.evidence.map(e => e.description).join(', '),
    })).slice(0, 5) // Limit to 5 cases for context

    const contextText = context.map(c => 
      `Case: ${c.title} (${c.date})\nDescription: ${c.description}\nEvidence: ${c.evidence}`
    ).join('\n\n')

    // Generate response using LLM
    const prompt = `You are an AI detective assistant. Answer the following question about the cases:

${contextText}

Question: ${query}

Provide a clear, concise answer based on the case information. If the information isn't available, say so.`

    let response = ''

    // Try Llama first, then OpenAI
    const useLlama = process.env.USE_LLAMA === 'true'
    if (useLlama) {
      try {
        const available = await llamaClient.checkAvailability()
        if (available) {
          response = await llamaClient.generate(prompt,
            'You are a helpful AI detective assistant. Answer questions clearly and concisely.'
          )
        }
      } catch (error) {
        console.error('Llama query error:', error)
      }
    }

    if (!response && process.env.OPENAI_API_KEY) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI detective assistant. Answer questions clearly and concisely.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      })
      response = completion.choices[0]?.message?.content || ''
    }

    if (!response) {
      response = 'I cannot answer that question at this time. Please ensure an LLM is configured.'
    }

    return NextResponse.json({ answer: response, relevantCases: context.map(c => c.id) })
  } catch (error) {
    console.error('Query error:', error)
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    )
  }
}
