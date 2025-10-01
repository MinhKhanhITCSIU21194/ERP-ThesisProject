# ERP System Authentication Testing

## Test Credentials:

- **Admin**: admin@company.com / AdminPass123!
- **User**: john.doe@company.com / Password123!
- **Test**: test@company.com / Password123!

## API Endpoints:

### 1. Check Email Exists

```bash
curl -X POST http://localhost:5000/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@company.com"}'
```

### 2. Sign In

```bash
curl -X POST http://localhost:5000/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@company.com", "password": "AdminPass123!"}'
```

### 3. Test Protected Route

```bash
# First get token from sign-in, then use it:
curl -X GET http://localhost:5000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Next Steps:

1. Run dummy-data.sql in your PostgreSQL database
2. Test the API endpoints using curl or Postman
3. Verify JWT tokens work correctly
