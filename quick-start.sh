#!/bin/bash

# AI Detective - Quick Start Script
# This script sets up and runs AI Detective locally in seconds

set -e

echo "🚀 AI Detective - Quick Start"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

echo -e "${BLUE}✓ Node.js found: $(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo -e "${BLUE}✓ npm found: $(npm --version)${NC}"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo ""
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${BLUE}✓ Dependencies already installed${NC}"
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo ""
    echo -e "${YELLOW}⚙️  Creating .env.local...${NC}"
    cat > .env.local << EOF
USE_LLAMA=true
OLLAMA_BASE_URL=http://localhost:11434
LLAMA_MODEL=llama3.2
NEXT_PUBLIC_CESIUM_BASE_URL=/cesium
EOF
    echo -e "${GREEN}✓ Environment file created${NC}"
else
    echo -e "${BLUE}✓ Environment file already exists${NC}"
fi

# Check for Ollama
echo ""
echo -e "${YELLOW}🤖 Checking Ollama setup...${NC}"

if command -v ollama &> /dev/null; then
    echo -e "${GREEN}✓ Ollama is installed${NC}"
    
    # Check if Ollama is running
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Ollama is running${NC}"
        
        # Check if llama3.2 model is installed
        if ollama list | grep -q "llama3.2"; then
            echo -e "${GREEN}✓ llama3.2 model is installed${NC}"
        else
            echo -e "${YELLOW}⚠️  llama3.2 model not found. Installing...${NC}"
            ollama pull llama3.2
            echo -e "${GREEN}✓ llama3.2 model installed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Ollama is not running. Starting Ollama...${NC}"
        echo -e "${BLUE}   (You may need to start it manually: ollama serve)${NC}"
        echo -e "${BLUE}   Or install from: https://ollama.ai${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Ollama is not installed (optional)${NC}"
    echo -e "${BLUE}   Install from: https://ollama.ai${NC}"
    echo -e "${BLUE}   Or use OpenAI API key in .env.local${NC}"
fi

# Check database
if [ ! -f "ai-detective.db" ]; then
    echo -e "${BLUE}✓ Database will be created on first run${NC}"
else
    echo -e "${BLUE}✓ Database exists${NC}"
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}Starting development server...${NC}"
echo -e "${BLUE}Open http://localhost:3000 in your browser${NC}"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the dev server
npm run dev
