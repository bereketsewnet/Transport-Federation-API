# Backend CMS - Quick Reference Card

## 🗄️ Database Tables

| Table | Type | Purpose | Row Count |
|-------|------|---------|-----------|
| `home_content` | Singleton | Home page content | 1 |
| `about_content` | Singleton | About page content | 1 |
| `executives` | Multiple | Executive members & experts | Multiple |
| `contact_info` | Singleton | Contact information | 1 |

## 🔌 API Endpoints Checklist

### Home Content
- [ ] `GET /api/cms/home-content` (Public)
- [ ] `PUT /api/cms/home-content` (Admin)
- [ ] `POST /api/cms/home-content/hero-image` (Admin, multipart)

### About Content
- [ ] `GET /api/cms/about-content` (Public)
- [ ] `PUT /api/cms/about-content` (Admin)

### Executives
- [ ] `GET /api/cms/executives` (Public)
- [ ] `GET /api/cms/executives/:id` (Public)
- [ ] `POST /api/cms/executives` (Admin)
- [ ] `PUT /api/cms/executives/:id` (Admin)
- [ ] `DELETE /api/cms/executives/:id` (Admin)
- [ ] `POST /api/cms/executives/:id/image` (Admin, multipart)

### Contact Info
- [ ] `GET /api/cms/contact-info` (Public)
- [ ] `PUT /api/cms/contact-info` (Admin)

**Total:** 15 endpoints (8 public, 7 admin)

## 📐 Naming Convention

| Database | API Response | Example |
|----------|--------------|---------|
| `hero_title_en` | `heroTitleEn` | Transform snake_case → camelCase |
| `values_en` (JSONB) | `valuesEn` (Array) | Parse JSON to array |

## 🔒 Authentication

```javascript
// Public endpoints - No auth
GET /api/cms/home-content
GET /api/cms/about-content
GET /api/cms/executives
GET /api/cms/executives/:id
GET /api/cms/contact-info

// Admin endpoints - Require JWT + admin role
PUT /api/cms/home-content
POST /api/cms/home-content/hero-image
PUT /api/cms/about-content
POST /api/cms/executives
PUT /api/cms/executives/:id
DELETE /api/cms/executives/:id
POST /api/cms/executives/:id/image
PUT /api/cms/contact-info
```

## 📝 Example Request/Response

### GET /api/cms/home-content
```json
{
  "data": {
    "id": 1,
    "heroTitleEn": "Transport & Communication Workers Federation",
    "heroTitleAm": "የትራንስፖርትና መገናኛ ሠራተኞች...",
    "stat1Value": 1250,
    "stat2Value": 19,
    ...
  }
}
```

### PUT /api/cms/home-content
```json
// Request
{
  "heroTitleEn": "New Title",
  "stat1Value": 1500
}

// Response
{
  "message": "Home content updated successfully",
  "data": { /* full updated object */ }
}
```

## ⚠️ Important Rules

### 1. Singleton Pattern
```sql
-- ✅ Do this (UPDATE)
UPDATE home_content SET hero_title_en = $1 WHERE TRUE;

-- ❌ Don't do this (INSERT)
INSERT INTO home_content (...) VALUES (...); -- Will fail!
```

### 2. JSON Fields
```sql
-- Store arrays as JSONB
values_en JSONB DEFAULT '[]'::jsonb

-- Example data
'["Humanity", "Commitment", "Democratic Culture"]'::jsonb
```

### 3. Image Handling
Two options:
- **Option A:** Store base64 in database (simpler)
- **Option B:** Save file, store path in database

### 4. Auto Timestamps
Triggers auto-update `updated_at` on all tables.

## 🧪 Testing Commands

```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('home_content', 'about_content', 'executives', 'contact_info');

-- Check singleton constraint
SELECT COUNT(*) FROM home_content; -- Should be 1
SELECT COUNT(*) FROM about_content; -- Should be 1
SELECT COUNT(*) FROM contact_info; -- Should be 1

-- Check executives
SELECT COUNT(*) FROM executives; -- Should be 8 initially
```

## 🚀 Quick Start

1. **Run migrations:**
   ```bash
   psql -U user -d db -f 01_create_cms_tables.sql
   psql -U user -d db -f 02_insert_default_cms_data.sql
   ```

2. **Verify data:**
   ```sql
   SELECT * FROM home_content;
   SELECT * FROM about_content;
   SELECT * FROM executives ORDER BY display_order;
   SELECT * FROM contact_info;
   ```

3. **Implement endpoints** (refer to `BACKEND_CMS_SPEC.md`)

4. **Test with Postman**

5. **Deploy and notify frontend team**

## 📚 Full Documentation

- **Detailed Spec:** `BACKEND_CMS_SPEC.md`
- **Simple Prompt:** `BACKEND_CMS_PROMPT.md`
- **Migration Guide:** `database-migrations/README.md`
- **Summary:** `CMS_IMPLEMENTATION_SUMMARY.md`

## ❓ Common Questions

**Q: Can I add more rows to home_content?**  
A: No, it's singleton (only 1 row allowed).

**Q: How do I update home_content?**  
A: Always use UPDATE, never INSERT.

**Q: What's the difference between executive and expert?**  
A: Both are in `executives` table. Type='executive' for main executives, type='expert' for carousel.

**Q: Should I store images as base64 or files?**  
A: Either works. Base64 is simpler for small images.

**Q: Do GET endpoints need authentication?**  
A: No, GET endpoints are public. Only PUT/POST/DELETE need auth.

## ✅ Done Checklist

- [ ] Migrations run successfully
- [ ] 15 endpoints implemented
- [ ] Authentication middleware applied
- [ ] Tested with Postman
- [ ] Postman collection created
- [ ] Deployed to server
- [ ] Frontend team notified

---

**Estimated Time:** 4-6 hours  
**Priority:** High  
**Contact:** Share questions in team chat

