# Authentication Validation

This document outlines the validation rules for user authentication in the Antigravity application.

## Sign Up

### Required Fields

| Field | Type | Required |
|-------|------|----------|
| Name | string | ✅ Yes |
| Email | string | ✅ Yes |
| Password | string | ✅ Yes |
| Confirm Password | string | ✅ Yes (frontend only) |

> **Note:** Username is auto-generated as `user_[random8chars]` and can be changed later in Profile Edit.

---

### Name Validation

| Rule | Value |
|------|-------|
| Required | Yes |
| Max Length | 50 characters |

---

### Email Validation

| Rule | Value |
|------|-------|
| Required | Yes |
| Format | RFC-compliant regex |

**Regex Pattern:**
```regex
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
```

**Valid Examples:**
- `user@example.com`
- `user.name@example.co.uk`
- `user+tag@example.com`

**Invalid Examples:**
- `user#@example.com` (special character `#`)
- `user@@example.com` (double `@`)
- `user@domain.c` (TLD too short)

---

### Password Validation

| Rule | Value |
|------|-------|
| Required | Yes |
| Min Length | 8 characters |
| Max Length | 100 characters |
| Uppercase | At least 1 (A-Z) |
| Lowercase | At least 1 (a-z) |
| Number | At least 1 (0-9) |
| Special Character | At least 1 (@$!%*?&) |

**Regex Pattern:**
```regex
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]
```

**Valid Examples:**
- `Password1!`
- `MyP@ss123`
- `Secure$456`

**Invalid Examples:**
- `password` (no uppercase, numbers, or special chars)
- `Password1` (no special character)
- `Pass1!` (too short)

---

## Sign In

### Required Fields

| Field | Type | Required |
|-------|------|----------|
| Email | string | ✅ Yes |
| Password | string | ✅ Yes |

Email and password use the same validation rules as Sign Up.

---

## Error Messages

### API Responses

| Scenario | HTTP Status | Message |
|----------|-------------|---------|
| Missing field | 400 | `{field} is required` |
| Invalid email | 400 | `Please provide a valid email address` |
| Weak password | 400 | `Password must contain at least 1 uppercase...` |
| Email in use | 409 | `Email is already in use` |
| Invalid credentials | 401 | `Invalid email or password` |

---

## Implementation Files

### Backend (API)
- [SignupDto](../apps/api/src/auth/dto/signup.dto.ts)
- [LoginDto](../apps/api/src/auth/dto/login.dto.ts)
- [AuthService](../apps/api/src/auth/auth.service.ts)

### Frontend (Mobile)
- [signup.tsx](../apps/mobile/app/auth/signup.tsx)
- [signin.tsx](../apps/mobile/app/auth/signin.tsx)

### Frontend (Web)
- [signup/page.tsx](../apps/web/app/auth/signup/page.tsx)
- [signin/page.tsx](../apps/web/app/auth/signin/page.tsx)
