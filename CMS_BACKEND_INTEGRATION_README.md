# CMS Backend Integration Guide

## 📖 Table of Contents

1. [Overview](#overview)
2. [Current vs Future State](#current-vs-future-state)
3. [Files Created](#files-created)
4. [Architecture](#architecture)
5. [Implementation Steps](#implementation-steps)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [Testing](#testing)
9. [Frontend Integration](#frontend-integration)
10. [FAQs](#faqs)

---

## Overview

This guide provides everything needed to move the CMS (Content Management System) functionality from browser localStorage to backend database storage. This will allow:

✅ **Home Page content** to be editable through admin panel  
✅ **About Page content** to be editable through admin panel  
✅ **Executive members** to be managed (add, edit, delete, upload photos)  
✅ **Contact Information** to be stored in database instead of .env file  
✅ **Content to persist** across devices and browsers  
✅ **Public access** to read content (no auth required)  
✅ **Admin-only access** to edit content (auth required)  

---

## Current vs Future State

### Current State (❌ Problem)
```
┌─────────────────┐
│  Admin Panel    │
│  (Browser)      │
│                 │
│  ┌───────────┐  │
│  │localStorage│ ← Content stored locally only
│  └───────────┘  │
│                 │
└─────────────────┘

Problems:
- Content lost on browser clear
- Not shared across devices
- No backup
- No version control
```

### Future State (✅ Solution)
```
┌─────────────────┐      API Calls       ┌──────────────┐
│  Admin Panel    │ ←──────────────────→ │   Backend    │
│  (Browser)      │   PUT /api/cms/*     │   Server     │
└─────────────────┘                      │              │
                                         │  ┌────────┐  │
┌─────────────────┐      API Calls      │  │Database│  │
│  Public Pages   │ ←──────────────────→│  │(PostgreSQL)
│  (Browser)      │   GET /api/cms/*    │  └────────┘  │
└─────────────────┘                      └──────────────┘

Benefits:
✅ Content persisted in database
✅ Shared across all devices
✅ Backed up with database
✅ Version controlled
✅ Public can read, admin can edit
```

---

## Files Created

### 📄 Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| `BACKEND_CMS_PROMPT.md` | Simple implementation prompt | Backend Developer |
| `BACKEND_CMS_SPEC.md` | Detailed API specification | Backend Developer |
| `BACKEND_QUICK_REFERENCE.md` | Quick lookup reference | Backend Developer |
| `CMS_IMPLEMENTATION_SUMMARY.md` | Project summary | Project Manager |
| `CMS_BACKEND_INTEGRATION_README.md` | This file - comprehensive guide | Everyone |

### 📁 Database Files

| File | Purpose |
|------|---------|
| `database-migrations/01_create_cms_tables.sql` | Creates 4 database tables |
| `database-migrations/02_insert_default_cms_data.sql` | Inserts default content |
| `database-migrations/README.md` | How to run migrations |

### 💻 Frontend Files

| File | Purpose |
|------|---------|
| `src/api/cms-endpoints.ts` | TypeScript API functions (ready to use) |

---

## Architecture

### Database Layer
```
┌──────────────────────────────────────────────┐
│           PostgreSQL Database                │
├──────────────────────────────────────────────┤
│  home_content (1 row)                        │
│  - Hero section, stats, overview             │
│                                              │
│  about_content (1 row)                       │
│  - Mission, vision, values, history, etc.    │
│                                              │
│  executives (multiple rows)                  │
│  - Executive members and experts with photos │
│                                              │
│  contact_info (1 row)                        │
│  - Address, phone, email, social media       │
└──────────────────────────────────────────────┘
```

### API Layer
```
┌──────────────────────────────────────────────┐
│              REST API Endpoints               │
├──────────────────────────────────────────────┤
│  Public (no auth):                           │
│  - GET /api/cms/home-content                 │
│  - GET /api/cms/about-content                │
│  - GET /api/cms/executives                   │
│  - GET /api/cms/executives/:id               │
│  - GET /api/cms/contact-info                 │
│                                              │
│  Admin only (JWT auth):                      │
│  - PUT /api/cms/home-content                 │
│  - POST /api/cms/home-content/hero-image     │
│  - PUT /api/cms/about-content                │
│  - POST /api/cms/executives                  │
│  - PUT /api/cms/executives/:id               │
│  - DELETE /api/cms/executives/:id            │
│  - POST /api/cms/executives/:id/image        │
│  - PUT /api/cms/contact-info                 │
└──────────────────────────────────────────────┘
```

### Frontend Layer
```
┌──────────────────────────────────────────────┐
│             React Components                  │
├──────────────────────────────────────────────┤
│  Admin:                                       │
│  - HomeEditor.tsx (edit home page)           │
│  - AboutEditor.tsx (edit about page)         │
│  - ContactInfoEditor.tsx (edit contact)      │
│                                              │
│  Public:                                      │
│  - Home.tsx (display home page)              │
│  - About.tsx (display about page)            │
│  - Contact.tsx (display contact info)        │
└──────────────────────────────────────────────┘
```

---

## Implementation Steps

### Phase 1: Backend Setup (Your Backend Developer)

#### Step 1: Run Database Migrations
```bash
# Navigate to project directory
cd /path/to/backend

# Run migration 1 (create tables)
psql -U your_username -d your_database -f database-migrations/01_create_cms_tables.sql

# Run migration 2 (insert default data)
psql -U your_username -d your_database -f database-migrations/02_insert_default_cms_data.sql

# Verify
psql -U your_username -d your_database
```

In PostgreSQL:
```sql
-- Check tables exist
\dt

-- Check data
SELECT COUNT(*) FROM home_content;    -- Should return 1
SELECT COUNT(*) FROM about_content;   -- Should return 1
SELECT COUNT(*) FROM executives;      -- Should return 8
SELECT COUNT(*) FROM contact_info;    -- Should return 1
```

#### Step 2: Implement API Endpoints

Create/update these backend files:
- `routes/cms.routes.js` or similar
- `controllers/cms.controller.js` or similar
- `models/cms.models.js` or similar (if using ORM)

Refer to `BACKEND_CMS_SPEC.md` for complete endpoint specifications.

#### Step 3: Add Authentication Middleware

```javascript
// Example middleware structure
router.get('/api/cms/home-content', publicAccess, getHomeContent);
router.put('/api/cms/home-content', requireAuth, requireAdmin, updateHomeContent);
```

#### Step 4: Test with Postman

Create a Postman collection with all 15 endpoints:
- Test public endpoints (no auth)
- Test admin endpoints (with JWT token)
- Test image uploads
- Test error cases

#### Step 5: Deploy

Deploy backend changes to your server and provide:
- ✅ API base URL
- ✅ Confirmation that all endpoints work
- ✅ Postman collection

---

### Phase 2: Frontend Integration (After Backend is Ready)

#### Step 1: Verify API Endpoints Work

Test each endpoint manually:
```bash
# Test public endpoint
curl https://your-api.com/api/cms/home-content

# Test admin endpoint (with auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-api.com/api/cms/home-content
```

#### Step 2: Update Frontend Components

I will update:
1. `src/pages/Admin/HomeEditor.tsx` - Use API instead of localStorage
2. `src/pages/Admin/AboutEditor.tsx` - Use API instead of localStorage
3. Create `src/pages/Admin/ContactInfoEditor.tsx` - New component
4. `src/pages/Public/Home.tsx` - Fetch from API
5. `src/pages/Public/About.tsx` - Fetch from API
6. `src/pages/Public/Contact.tsx` - Fetch from API

#### Step 3: Add Loading & Error States

Add proper loading spinners and error handling for all API calls.

#### Step 4: Test End-to-End

- ✅ Test reading content (public pages)
- ✅ Test editing content (admin panel)
- ✅ Test image uploads
- ✅ Test error scenarios
- ✅ Test on multiple devices

---

## API Endpoints

### Complete Endpoint List

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/cms/home-content` | Public | Get home page content |
| PUT | `/api/cms/home-content` | Admin | Update home page content |
| POST | `/api/cms/home-content/hero-image` | Admin | Upload hero image |
| GET | `/api/cms/about-content` | Public | Get about page content |
| PUT | `/api/cms/about-content` | Admin | Update about page content |
| GET | `/api/cms/executives` | Public | List all executives/experts |
| GET | `/api/cms/executives/:id` | Public | Get single executive |
| POST | `/api/cms/executives` | Admin | Create new executive |
| PUT | `/api/cms/executives/:id` | Admin | Update executive |
| DELETE | `/api/cms/executives/:id` | Admin | Delete executive |
| POST | `/api/cms/executives/:id/image` | Admin | Upload executive photo |
| GET | `/api/cms/contact-info` | Public | Get contact information |
| PUT | `/api/cms/contact-info` | Admin | Update contact information |

**Total:** 13 endpoints (5 public, 8 admin)

For detailed request/response examples, see `BACKEND_CMS_SPEC.md`.

---

## Database Schema

### Tables Summary

#### 1. `home_content` (Singleton)
- Hero titles and subtitles (English & Amharic)
- Overview text (English & Amharic)
- 4 statistics with labels and values
- Hero image (optional)

#### 2. `about_content` (Singleton)
- Mission and vision statements
- Values (JSON array)
- History text
- Objectives (JSON array)
- Organizational structure
- Stakeholders list

#### 3. `executives` (Multiple rows)
- Names and positions (bilingual)
- Bio (optional, bilingual)
- Photo (base64 or file path)
- Type (executive or expert)
- Display order

#### 4. `contact_info` (Singleton)
- Physical address (bilingual)
- Contact numbers (phone, phone2, fax)
- Email and PO Box
- Map URL and coordinates
- Social media links (5 platforms)
- Working hours (bilingual)

For complete SQL schema, see `database-migrations/01_create_cms_tables.sql`.

---

## Testing

### Backend Testing Checklist

- [ ] All tables created successfully
- [ ] Default data inserted (1 home, 1 about, 8 executives, 1 contact)
- [ ] Public GET endpoints work without authentication
- [ ] Admin PUT/POST/DELETE endpoints require authentication
- [ ] Admin endpoints reject non-admin users
- [ ] Image uploads work (hero image & executive photos)
- [ ] Singleton tables reject duplicate inserts
- [ ] JSON fields parse correctly (arrays)
- [ ] Updated_at timestamps update automatically
- [ ] Error responses have proper status codes and messages

### Frontend Testing Checklist

(After integration)
- [ ] Home page displays content from API
- [ ] About page displays content from API
- [ ] Contact page displays info from API
- [ ] Admin can edit home content
- [ ] Admin can edit about content
- [ ] Admin can add/edit/delete executives
- [ ] Admin can upload images
- [ ] Admin can edit contact info
- [ ] Loading states show correctly
- [ ] Error messages display correctly
- [ ] Changes persist after page refresh

---

## Frontend Integration

### Example: Updating HomeEditor.tsx

**Before (using localStorage):**
```typescript
const onSubmit = async (data: HomeFormData) => {
  console.log('Home page data:', data);
  localStorage.setItem('tcwf_home_content', JSON.stringify(data));
  alert('Home page updated successfully!');
};
```

**After (using API):**
```typescript
import { updateHomeContent } from '@api/cms-endpoints';

const onSubmit = async (data: HomeFormData) => {
  try {
    const response = await updateHomeContent({
      heroTitleEn: data.heroTitleEn,
      heroTitleAm: data.heroTitleAm,
      // ... other fields
    });
    toast.success('Home page updated successfully!');
  } catch (error) {
    toast.error('Failed to update home page');
    console.error(error);
  }
};
```

### Example: Fetching Content on Public Page

**Before (using static data):**
```typescript
const homeContent = defaultHomeContent;
```

**After (using API):**
```typescript
import { getHomeContent } from '@api/cms-endpoints';

const [content, setContent] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchContent = async () => {
    try {
      const response = await getHomeContent();
      setContent(response.data.data);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchContent();
}, []);
```

---

## FAQs

### General Questions

**Q: Why move from localStorage to database?**  
A: localStorage is browser-specific and gets cleared. Database persists data, enables multi-device access, and provides backup.

**Q: How long will this take?**  
A: Backend: 4-6 hours, Frontend integration: 2-3 hours. Total: ~7-9 hours.

**Q: Can we do this in phases?**  
A: Yes! Implement home content first, then about, then executives, then contact.

### Backend Questions

**Q: What's a singleton table?**  
A: A table that only allows 1 row. Used for `home_content`, `about_content`, and `contact_info`.

**Q: How do I enforce singleton pattern?**  
A: The unique index on `(TRUE)` prevents duplicate rows. Always use UPDATE, not INSERT.

**Q: Should I store images as base64 or files?**  
A: Either works. Base64 is simpler but increases database size. File storage is better for large images.

**Q: What's the difference between executive and expert?**  
A: Both stored in `executives` table. Type='executive' for main executives, type='expert' for carousel display.

### Frontend Questions

**Q: Will existing localStorage data be migrated?**  
A: No, but default data is pre-populated in database. Admins can re-enter any custom changes.

**Q: Do public pages need authentication?**  
A: No, GET endpoints are public. Only admin editing requires authentication.

**Q: What if the API is down?**  
A: Add error handling and fallback to default content or show error message.

---

## Next Steps

### For Backend Developer:

1. ✅ Read `BACKEND_CMS_PROMPT.md` (start here)
2. ✅ Review `BACKEND_CMS_SPEC.md` (detailed spec)
3. ✅ Use `BACKEND_QUICK_REFERENCE.md` (quick lookup)
4. ✅ Run SQL migrations from `database-migrations/`
5. ✅ Implement 15 API endpoints
6. ✅ Test with Postman
7. ✅ Deploy and share API base URL

### For Frontend Developer (Me):

1. ⏳ Wait for backend endpoints
2. ⏳ Verify endpoints work
3. ⏳ Update admin components to use API
4. ⏳ Update public components to fetch from API
5. ⏳ Add loading/error states
6. ⏳ Test end-to-end
7. ⏳ Deploy frontend

---

## Support

### Documentation References

- **Start Here:** `BACKEND_CMS_PROMPT.md`
- **Full Spec:** `BACKEND_CMS_SPEC.md`
- **Quick Lookup:** `BACKEND_QUICK_REFERENCE.md`
- **Summary:** `CMS_IMPLEMENTATION_SUMMARY.md`
- **This Guide:** `CMS_BACKEND_INTEGRATION_README.md`

### Need Help?

- Backend questions: See `BACKEND_CMS_SPEC.md`
- Database questions: See `database-migrations/README.md`
- Quick answers: See `BACKEND_QUICK_REFERENCE.md`
- Project overview: See `CMS_IMPLEMENTATION_SUMMARY.md`

---

**Status:** ✅ Documentation complete, ready for implementation  
**Next:** Backend developer implements endpoints → Frontend integration  
**Priority:** High  
**Estimated Timeline:** 7-9 hours total

