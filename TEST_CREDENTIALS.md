# 🔐 Test Credentials

## Quick Reference - Login Accounts

After running `npm run seed:all`, use these credentials to test the authentication system.

---

## 👨‍💼 Admin Account

**Username:** `admin`  
**Password:** `admin123`  
**Role:** `admin`  
**Email:** `admin@example.com`

✅ **Status:** Ready to login immediately (no password change required)  
✅ **Security Questions:** Already configured  
✅ **Permissions:** Full access to all endpoints

---

## 👤 Test Member Accounts

### Test User 1

**Username:** `testuser1`  
**Password:** `test123`  
**Role:** `member`  
**Email:** `testuser1@example.com`

⚠️ **Status:** MUST change password on first login  
⚠️ **Security Questions:** Must set 3 questions during password change  
✅ **Permissions:** Member-level access

### Test User 2

**Username:** `testuser2`  
**Password:** `test123`  
**Role:** `member`  
**Email:** `testuser2@example.com`

⚠️ **Status:** MUST change password on first login  
⚠️ **Security Questions:** Must set 3 questions during password change  
✅ **Permissions:** Member-level access

**Note:** All members must change their password and set 3 security questions on first login. Only admin can login directly without password change.

---

## 🔒 Security Questions (For Forgot Password Testing)

All test accounts have these security questions configured:

| Question ID | Question | Answer |
|-------------|----------|--------|
| 4 | "In what city were you born?" | `addis ababa` |
| 2 | "What is your mother's maiden name?" | `smith` |
| 3 | "What was the name of your first pet?" | `fluffy` |

**Note:** Answers are case-insensitive and trimmed of whitespace.

---

## 🧪 Testing Scenarios

### 1. Normal Login (Admin)
```bash
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJ...",
  "user": {
    "id": 1,
    "mem_id": 1,
    "username": "admin",
    "role": "admin"
  },
  "message": "Login successful"
}
```

### 2. Normal Login (Member)
```bash
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "username": "testuser1",
  "password": "test123"
}
```

### 3. Forgot Password Flow

**Step 1: Get Security Questions**
```bash
POST http://localhost:4000/api/auth/forgot-password/step1
Content-Type: application/json

{
  "username": "testuser1"
}
```

**Expected Response:**
```json
{
  "username": "testuser1",
  "securityQuestions": [
    { "questionId": 4, "question": "In what city were you born?" },
    { "questionId": 2, "question": "What is your mother's maiden name?" },
    { "questionId": 3, "question": "What was the name of your first pet?" }
  ],
  "message": "Please answer all 3 security questions"
}
```

**Step 2: Answer Questions & Reset Password**
```bash
POST http://localhost:4000/api/auth/forgot-password/step2
Content-Type: application/json

{
  "username": "testuser1",
  "answers": [
    "addis ababa",
    "smith",
    "fluffy"
  ],
  "newPassword": "NewPassword123!"
}
```

**Expected Response:**
```json
{
  "message": "Password reset successful. You can now login with your new password."
}
```

---

## 📱 Frontend Integration

### React/TypeScript Example

```typescript
// Login
const response = await axios.post('http://localhost:4000/api/auth/login', {
  username: 'admin',
  password: 'admin123'
});

// Store token
localStorage.setItem('token', response.data.token);

// Use token in subsequent requests
axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
```

### Handle Password Change Required

```typescript
const response = await axios.post('http://localhost:4000/api/auth/login', {
  username: 'newmember',
  password: 'defaultPassword'
});

if (response.data.requirePasswordChange) {
  // Redirect to password change page
  localStorage.setItem('tempToken', response.data.tempToken);
  router.push('/change-password');
} else {
  // Normal login
  localStorage.setItem('token', response.data.token);
  router.push('/dashboard');
}
```

---

## 🔄 Additional Member Accounts

The seeding script also creates login accounts for **20% of seeded members** (configurable via `LOGIN_ACCOUNT_PCT`).

These accounts have:
- **Username:** `{firstname}.{lastname}.{mem_id}`
- **Password:** `Password123!` (from `DEFAULT_USER_PASSWORD` env var)
- **Role:** `member`
- **Status:** Require password change on first login (no security questions set)

---

## ⚙️ Customization

You can customize test credentials by setting environment variables before running seed:

```bash
# .env file
ADMIN_USERNAME=myadmin
ADMIN_PASSWORD=MySecurePass123!
ADMIN_EMAIL=admin@mycompany.com

TEST_USER1_USERNAME=john.doe
TEST_USER1_PASSWORD=JohnPass123!
TEST_USER1_EMAIL=john@example.com

TEST_USER2_USERNAME=jane.smith
TEST_USER2_PASSWORD=JanePass123!
TEST_USER2_EMAIL=jane@example.com

DEFAULT_USER_PASSWORD=DefaultMemberPass123!
```

---

## 🚀 Quick Start

1. **Run migrations:**
   ```bash
   npm run migrate:security
   npm run migrate:photos
   ```

2. **Seed database:**
   ```bash
   npm run seed:all
   ```

3. **Note the credentials** displayed at the end of seeding

4. **Start server:**
   ```bash
   npm run dev
   ```

5. **Test login:**
   - Frontend: Use credentials above
   - Postman: Import `postman_endpoint.json` and use variables
   - cURL: See examples above

---

## 🎯 What Works Now

✅ **Immediate Login** - Admin and test users ready to use  
✅ **Security Questions** - Pre-configured for forgot password testing  
✅ **Password Reset** - Self-service via security questions  
✅ **Admin Reset** - Admin can reset any member password  
✅ **First-Time Flow** - New members must change password on first login  
✅ **Token Auth** - JWT-based authentication  
✅ **Role-Based Access** - Admin vs Member permissions

---

## 📚 Related Documentation

- **Authentication Guide:** `MEMBER_AUTHENTICATION_GUIDE.md`
- **API Examples:** `ENDPOINTS_EXAMPLES.md`
- **Photo Upload:** `PHOTO_UPLOAD_GUIDE.md`

Your authentication system is fully functional! 🎉

