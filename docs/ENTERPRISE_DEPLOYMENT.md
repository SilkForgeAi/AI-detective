# Enterprise Deployment Guide

## Overview

AI Detective is designed for enterprise deployment with complete privacy and local control. The stack (Ollama + SQLite/PostgreSQL + Next.js) requires **zero cloud dependencies**.

## Deployment Options

### 1. Docker Container (Recommended)

**Quick Start:**
```bash
docker run -d \
  --name ai-detective \
  -p 3000:3000 \
  -v ./data:/app/data \
  -v ./uploads:/app/uploads \
  -e USE_LLAMA=true \
  -e OLLAMA_BASE_URL=http://ollama:11434 \
  ai-detective:latest
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  ai-detective:
    image: ai-detective:latest
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    environment:
      - USE_LLAMA=true
      - OLLAMA_BASE_URL=http://ollama:11434
      - DATABASE_PATH=/app/data/ai-detective.db
    depends_on:
      - ollama
      - postgres
  
  ollama:
    image: ollama/ollama:latest
    volumes:
      - ollama-data:/root/.ollama
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=ai_detective
      - POSTGRES_USER=detective
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  ollama-data:
  postgres-data:
```

### 2. Kubernetes Deployment

**Helm Chart** (coming soon):
```bash
helm install ai-detective ./helm/ai-detective \
  --set ollama.enabled=true \
  --set database.type=postgresql \
  --set ingress.enabled=true
```

### 3. Virtual Appliance

Pre-configured VM image with:
- AI Detective pre-installed
- Ollama configured
- Database initialized
- One-click deployment

**System Requirements:**
- 4+ CPU cores
- 16GB+ RAM
- 100GB+ storage
- Ubuntu 22.04 LTS or RHEL 8+

### 4. Bare Metal Installation

**Installation Steps:**
```bash
# 1. Install dependencies
sudo apt-get update
sudo apt-get install -y nodejs npm postgresql

# 2. Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama3.2

# 3. Clone and setup
git clone https://github.com/Silkforgeai/ai-detective.git
cd ai-detective
npm install
npm run build

# 4. Configure
cp .env.example .env.local
# Edit .env.local

# 5. Start
npm start
```

## Enterprise Features

### Security

- **Authentication**: SSO, LDAP, Active Directory support
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: Data encryption at rest and in transit
- **Audit Logging**: Comprehensive audit trails
- **Compliance**: GDPR, HIPAA, CJIS compliance features

### Performance

- **Scalability**: Horizontal scaling support
- **Caching**: Redis integration for performance
- **Load Balancing**: Multi-instance deployment
- **Database**: PostgreSQL for production workloads

### Integration

- **APIs**: RESTful API for integrations
- **Webhooks**: Event-driven integrations
- **Export**: Multiple export formats
- **Import**: Bulk data import capabilities

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ai_detective
# or
DATABASE_PATH=./ai-detective.db  # SQLite

# LLM
USE_LLAMA=true
OLLAMA_BASE_URL=http://localhost:11434
LLAMA_MODEL=llama3.2

# Security
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# LDAP (optional)
LDAP_SERVER=ldap://your-ldap-server
LDAP_BASE_DN=dc=example,dc=com

# Features
ENABLE_PLUGINS=true
PLUGIN_DIRECTORY=./plugins
```

## Support

For enterprise support:
- Email: enterprise@yourdomain.com
- Documentation: https://github.com/Silkforgeai/ai-detective/docs
- Support Portal: (coming soon)

## Licensing

- **Open Source**: MIT License (free)
- **Enterprise**: Commercial license available
  - Enterprise support
  - Advanced features
  - Custom development
  - Training and consulting
