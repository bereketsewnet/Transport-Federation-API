# 🎨 Frontend Login Guide - Quick Start

## ⚡ TL;DR - Use These to Login NOW

Your API is ready! Use these credentials in your frontend:

```
URL: http://localhost:4000/api/auth/login

✅ Admin Login (Direct Access):
  username: admin
  password: admin123
  → Logs in immediately, no password change needed

⚠️ Member Login (First-Time Setup):
  username: testuser1
  password: test123
  → Must change password + set 3 security questions
```

**Admin** logs in directly. **Members** must complete first-time setup! 🚀

---

## 🐛 Fixing Your Current Error

You're getting `401 Invalid credentials` because you need to:

1. **Make sure database is seeded:**
   ```bash
   npm run seed:all
   ```

2. **Use the correct credentials above**

3. **Check your frontend is sending to the right endpoint:**
   ```
   POST http://localhost:4000/api/auth/login
   ```

---

## 📋 Frontend Login Implementation

### React/TypeScript with Axios

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:4000';

interface LoginResponse {
  token?: string;
  tempToken?: string;
  requirePasswordChange?: boolean;
  requireSecurityQuestions?: boolean;
  user?: {
    id: number;
    mem_id: number;
    username: string;
    role: string;
  };
  message: string;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      username,
      password
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Login failed');
  }
};

// Usage in component
const handleLogin = async (username: string, password: string) => {
  try {
    const data = await login(username, password);
    
    if (data.requirePasswordChange) {
      // User needs to change password (first-time login)
      localStorage.setItem('tempToken', data.tempToken!);
      router.push('/change-password');
    } else {
      // Normal login - store token
      localStorage.setItem('token', data.token!);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    }
  } catch (error: any) {
    alert(error.message); // Show error to user
  }
};
```

---

## 🔐 Complete Login Form Example

```tsx
import { useState } from 'react';
import axios from 'axios';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:4000/api/auth/login', {
        username,
        password
      });

      const { token, user, requirePasswordChange, tempToken } = response.data;

      if (requirePasswordChange) {
        // First-time login or password reset required
        localStorage.setItem('tempToken', tempToken);
        window.location.href = '/change-password';
      } else {
        // Normal successful login
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Set default auth header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Redirect based on role
        if (user.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/member/dashboard';
        }
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else if (err.response?.status === 403) {
        setError('Account is locked. Contact administrator.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}

      <div>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="admin or testuser1"
        />
      </div>

      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="admin123 or test123"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <p>
        <a href="/forgot-password">Forgot Password?</a>
      </p>
    </form>
  );
}
```

---

## 🎯 API Response Formats

### Success - Normal Login
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "mem_id": 9019,
    "username": "admin",
    "role": "admin"
  },
  "message": "Login successful"
}
```

### Success - Password Change Required
```json
{
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "requirePasswordChange": true,
  "requireSecurityQuestions": true,
  "message": "Password change required. Please change your password and set security questions."
}
```

### Error - Invalid Credentials
```json
Status: 401
{
  "message": "Invalid credentials"
}
```

### Error - Account Locked
```json
Status: 403
{
  "message": "Account locked. Contact administrator."
}
```

---

## 🔒 Using Auth Token for API Calls

After login, include the token in all API requests:

```typescript
// Set default header for all requests
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Or per request
const response = await axios.get('http://localhost:4000/api/members', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🛠️ Axios Configuration

Create a central axios instance:

```typescript
// src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (logout on token expiry)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Usage
import apiClient from './api/client';

const response = await apiClient.post('/api/auth/login', { username, password });
```

---

## 📱 Testing Tips

### 1. Test with Browser DevTools
```javascript
// Open Console
fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
})
.then(r => r.json())
.then(console.log);
```

### 2. Test with cURL
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. Check CORS Settings
Make sure your API allows requests from your frontend origin:

```javascript
// Backend: src/app.js (already configured)
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite dev server
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

---

## ⚠️ Common Errors & Solutions

### Error: `401 Invalid credentials`
**Cause:** Wrong username/password or database not seeded  
**Solution:** Run `npm run seed:all` and use correct credentials above

### Error: `Network Error` or `ERR_CONNECTION_REFUSED`
**Cause:** Backend server not running  
**Solution:** Run `npm run dev` in backend directory

### Error: `CORS policy` blocked
**Cause:** CORS not configured for your frontend URL  
**Solution:** Update `src/app.js` cors origin to match your frontend

### Error: Token expired
**Cause:** JWT token expired (24 hours default)  
**Solution:** Login again or implement refresh token

---

## 🎉 Quick Test Checklist

- [ ] Backend server running on `http://localhost:4000`
- [ ] Database seeded with `npm run seed:all`
- [ ] Frontend using correct API URL
- [ ] Using credentials: `admin / admin123` or `testuser1 / test123`
- [ ] CORS configured for your frontend origin
- [ ] Token being stored in localStorage after successful login
- [ ] Token being sent in Authorization header for protected routes

---

## 📚 Related Files

- **All Test Credentials:** `TEST_CREDENTIALS.md`
- **Complete Auth Guide:** `MEMBER_AUTHENTICATION_GUIDE.md`
- **API Documentation:** `ENDPOINTS_EXAMPLES.md`

Your frontend should work now! If you still have issues, check the backend logs for errors. 🚀

