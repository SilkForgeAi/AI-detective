# Authentication & Access Control

## Current Implementation

AI Detective now requires **authentication** to upload files and run cases. This ensures:

- ✅ **Privacy**: Only authenticated users can access cases
- ✅ **Security**: Prevents unauthorized access to sensitive data
- ✅ **Accountability**: All actions are tied to user accounts
- ✅ **Multi-user Support**: Multiple users can work independently

## How It Works

### 1. User Registration/Login

Users must register and login before using the system:

```typescript
// Registration
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}

// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### 2. Session Management

After login, a session cookie is set:
- **Cookie Name**: `session`
- **Duration**: 7 days
- **HttpOnly**: Yes (prevents XSS)
- **Secure**: Yes (in production, HTTPS only)

### 3. Protected Endpoints

The following endpoints require authentication:

- ✅ `POST /api/cases` - Create new case
- ✅ `POST /api/upload` - Upload files
- ✅ `POST /api/analyze` - Run AI analysis
- ✅ `PUT /api/cases/[id]` - Update case
- ✅ `DELETE /api/cases/[id]` - Delete case

**Public Endpoints** (no auth required):
- `GET /api/cases` - View cases (filtered by user)
- `GET /api/cases/fetch-public` - Fetch public cases

### 4. User-Scoped Data

All cases are automatically scoped to the user who created them:
- Users can only see their own cases
- Cases include `userId` field
- Database queries filter by user ID

## Configuration

### Enable/Disable Authentication

To make the system public (no auth required), you can:

1. **Remove auth checks** from API routes (not recommended)
2. **Create a public mode** configuration

For production, authentication should always be enabled.

### Session Storage

Currently using in-memory sessions. For production, consider:

- **Redis**: Distributed session storage
- **Database**: Persistent session storage
- **NextAuth**: Full-featured authentication library

## User Roles

Current roles:
- **user**: Standard user (default)
- **admin**: Administrator (full access)

Future roles:
- **viewer**: Read-only access
- **analyst**: Can analyze but not create cases
- **investigator**: Full case management

## Security Best Practices

1. ✅ **Password Hashing**: Using bcryptjs
2. ✅ **Session Cookies**: HttpOnly, Secure flags
3. ✅ **Input Validation**: All inputs validated
4. ✅ **SQL Injection**: Using parameterized queries (Drizzle ORM)
5. ✅ **XSS Protection**: React escapes by default

## Migration Guide

If you have existing cases without user IDs:

```sql
-- Add default user to existing cases
UPDATE cases SET userId = 'default-user-id' WHERE userId IS NULL;
```

## Future Enhancements

- [ ] OAuth integration (Google, GitHub, etc.)
- [ ] Two-factor authentication (2FA)
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Role-based access control (RBAC)
- [ ] API key authentication
- [ ] LDAP/Active Directory integration

## Troubleshooting

### "Authentication required" error

1. Make sure you're logged in
2. Check that session cookie is set
3. Verify session hasn't expired (7 days)
4. Clear cookies and login again

### Can't see cases

1. Cases are user-scoped
2. Make sure you're logged in as the correct user
3. Check that cases have the correct `userId`
