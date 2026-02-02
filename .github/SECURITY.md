# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please **DO NOT** open a public issue. Instead, please email security@yourdomain.com or use GitHub's private vulnerability reporting feature.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Time

We aim to respond to security reports within 48 hours and provide a fix within 7 days for critical vulnerabilities.

## Security Best Practices

- Keep dependencies updated: `npm audit fix`
- Use environment variables for sensitive data
- Never commit API keys or secrets
- Use HTTPS in production
- Regularly review access logs
- Follow principle of least privilege

## Known Security Considerations

- This tool handles sensitive case data - ensure proper access controls
- Database should be encrypted at rest
- API endpoints should be rate-limited
- File uploads should be validated and scanned
- All user inputs should be sanitized
