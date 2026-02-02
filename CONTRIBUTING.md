# Contributing to AI Detective

Thank you for your interest in contributing to AI Detective! This document provides guidelines and information for contributors.

## Code of Conduct

This project is dedicated to solving cold cases ethically and responsibly. All contributors must:

- Respect privacy and confidentiality
- Use only public/open data
- Follow ethical guidelines for AI in law enforcement
- Maintain sensitivity when dealing with sensitive topics

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/Silkforgeai/ai-detective.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Guidelines

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── page.tsx           # Main page
│   └── layout.tsx         # Root layout
├── components/            # React components
├── lib/                   # Core libraries
│   ├── analysis/         # Analysis modules
│   └── ethics/           # Ethical safeguards
├── types/                 # TypeScript types
└── public/               # Static assets
```

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting (Prettier)
- Write descriptive commit messages
- Add JSDoc comments for public functions

### Adding New Analysis Modules

1. Create a new file in `lib/analysis/`
2. Export functions that follow the existing pattern
3. Add types to `types/case.ts` if needed
4. Integrate into `app/api/analyze/route.ts`
5. Add UI components in `components/` to display results

### Testing

- Test with sample public cases only
- Verify privacy/anonymization works
- Check that analysis results are reasonable
- Ensure error handling is robust

## Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass
3. Add/update tests for new features
4. Update CHANGELOG.md
5. Submit PR with clear description

## Areas for Contribution

### High Priority

- [ ] File upload support (PDF, images, OCR)
- [ ] Timeline visualization
- [ ] Geographic mapping
- [ ] Natural language querying
- [ ] Plugin architecture implementation

### Medium Priority

- [ ] Enhanced pattern matching algorithms
- [ ] More sophisticated anomaly detection
- [ ] Bias detection and mitigation
- [ ] Performance optimizations
- [ ] Additional data source integrations

### Documentation

- [ ] Tutorial videos
- [ ] Case study examples
- [ ] API documentation
- [ ] Deployment guides

## Questions?

Open an issue or start a discussion. We're here to help!
