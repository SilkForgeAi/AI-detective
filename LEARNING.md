# AI Detective Learning System

## Overview

The AI Detective includes a comprehensive learning system that enables the AI to learn from feedback, improve accuracy, and work towards a 95% accuracy target. The system uses Llama models (via Ollama) for local LLM inference and learns from verified case outcomes.

## Features

### 1. **Llama Integration**
- Supports local LLM inference using Ollama
- Configurable model selection (llama3.2, llama3, llama2, etc.)
- Falls back to OpenAI if Llama is unavailable
- No API costs for local inference

### 2. **Feedback System**
- Record case outcomes and accuracy
- Verify insights, hypotheses, and anomalies
- Track correct vs incorrect predictions
- Store training examples for continuous improvement

### 3. **Accuracy Tracking**
- Overall accuracy metrics
- Component-level accuracy (insights, hypotheses, anomalies)
- Confidence calibration
- Improvement trends over time

### 4. **Self-Improvement**
- Adjusts analysis strategy based on learned patterns
- Identifies and learns from common mistakes
- Adapts confidence thresholds based on performance
- Generates learning-enhanced prompts

## Setup

### Install Ollama

1. **Download Ollama**: https://ollama.ai
2. **Install and start Ollama**
3. **Pull Llama model**:
```bash
ollama pull llama3.2
# or
ollama pull llama3
```

### Configure Environment

Add to `.env.local`:
```bash
# Enable Llama (set to 'true' to use local LLM)
USE_LLAMA=true

# Ollama base URL (default: http://localhost:11434)
OLLAMA_BASE_URL=http://localhost:11434

# Llama model name (default: llama3.2)
LLAMA_MODEL=llama3.2

# Optional: OpenAI API key (fallback)
OPENAI_API_KEY=your_key_here
```

## Usage

### 1. Run Analysis with Learning

The system automatically uses learning metrics when available:

```typescript
// Analysis automatically incorporates:
// - Past accuracy metrics
// - Common mistakes to avoid
// - Learned rules and patterns
// - Confidence threshold adjustments
```

### 2. Provide Feedback

After analysis, click "Provide Feedback" to:
- Rate overall accuracy (0-100%)
- Mark insights as correct/incorrect
- Verify hypotheses
- Validate anomalies
- Record case outcome

### 3. View Learning Metrics

Click "Learning" in the header to see:
- Average accuracy and progress to 95%
- Accuracy by component
- Recent accuracy trends
- Common mistakes being learned from

## How It Learns

### Learning Loop

1. **Analysis**: AI analyzes case using current strategy
2. **Feedback**: Human verifies findings and provides accuracy
3. **Learning**: System records outcomes and identifies patterns
4. **Adjustment**: Strategy updated based on learned patterns
5. **Improvement**: Next analysis uses improved strategy

### Strategy Adjustments

The system automatically adjusts:
- **Confidence Thresholds**: Higher if accuracy low, lower if accuracy high
- **Pattern Matching Weight**: Reduced if pattern errors common
- **Anomaly Sensitivity**: Adjusted based on false positive rate
- **Focus Areas**: Prioritizes areas with common mistakes

### Common Mistakes Learning

The system identifies and learns from:
- Pattern matching errors
- Timeline inconsistencies
- Evidence interpretation mistakes
- Witness analysis errors

## Accuracy Goals

- **Target**: 95% accuracy
- **Current**: Tracked in Learning Dashboard
- **Progress**: Visualized with progress bars
- **Trend**: Shows improvement over time

## Training Data

Training examples are automatically collected:
- Stored in browser localStorage
- Includes case data, analysis, and feedback
- Can be exported for fine-tuning
- Last 100 examples kept for efficiency

## API Endpoints

### POST `/api/feedback`
Submit feedback on a case analysis:
```json
{
  "caseId": "123",
  "verified": true,
  "accuracy": 85,
  "correctInsights": ["insight1", "insight2"],
  "incorrectInsights": ["insight3"],
  "correctHypotheses": ["hyp1"],
  "incorrectHypotheses": ["hyp2"],
  "actualOutcome": "solved",
  "verifiedAt": "2024-01-01T00:00:00Z"
}
```

### GET `/api/feedback`
Get learning metrics and current strategy

## Best Practices

1. **Provide Regular Feedback**: The more feedback, the better the learning
2. **Be Accurate**: Honest feedback improves the system
3. **Verify Findings**: Always verify AI suggestions
4. **Track Progress**: Monitor learning dashboard regularly
5. **Use Llama Locally**: Reduces costs and improves privacy

## Troubleshooting

### Llama Not Working
- Ensure Ollama is running: `ollama serve`
- Check model is pulled: `ollama list`
- Verify OLLAMA_BASE_URL in .env.local

### Low Accuracy
- Provide more feedback on cases
- Verify findings carefully
- Check common mistakes in dashboard
- System needs time to learn (10+ verified cases recommended)

### No Learning Data
- Provide feedback on at least one case
- Check browser localStorage is enabled
- Verify feedback is being submitted successfully

## Future Enhancements

- [ ] Fine-tuning Llama models on collected data
- [ ] Export training data for external fine-tuning
- [ ] Multi-user feedback aggregation
- [ ] Advanced pattern recognition learning
- [ ] Cross-case learning patterns
- [ ] Automated accuracy validation
