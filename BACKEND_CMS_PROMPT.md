# Prompt for Backend Developer

## Task Overview
We need to add CMS (Content Management System) functionality to the backend to allow admin users to edit website content (Home page, About page, and Contact information) through the admin panel. Currently, this content is stored in localStorage on the frontend, but we need to move it to the database.

## What You Need to Do

### 1. Create Database Tables

Create 4 new tables in your PostgreSQL database:

1. **`home_content`** - Stores home page content (hero section, statistics, overview)
2. **`about_content`** - Stores about page content (mission, vision, values, history, etc.)
3. **`executives`** - Stores executive members and experts with their photos
4. **`contact_info`** - Stores contact information (address, phone, email, social media links)

**📄 Full SQL Schema:** See `BACKEND_CMS_SPEC.md` file for complete CREATE TABLE statements.

### 2. Insert Default Data

After creating tables, insert initial/default data into:
- `home_content` (1 row)
- `about_content` (1 row)
- `contact_info` (1 row)
- `executives` (8 rows for initial executives)

**📄 Default Data:** I can provide the INSERT statements or you can extract from the frontend's `src/config/content.ts` file.

### 3. Implement API Endpoints

Create the following REST API endpoints:

#### Home Content
- `GET /api/cms/home-content` - Get home page content (public)
- `PUT /api/cms/home-content` - Update home page content (admin only)
- `POST /api/cms/home-content/hero-image` - Upload hero image (admin only, multipart/form-data)

#### About Content
- `GET /api/cms/about-content` - Get about page content (public)
- `PUT /api/cms/about-content` - Update about page content (admin only)

#### Executives
- `GET /api/cms/executives` - List all executives/experts (public, supports ?type=executive|expert filter)
- `GET /api/cms/executives/:id` - Get single executive (public)
- `POST /api/cms/executives` - Create new executive (admin only)
- `PUT /api/cms/executives/:id` - Update executive (admin only)
- `DELETE /api/cms/executives/:id` - Delete executive (admin only)
- `POST /api/cms/executives/:id/image` - Upload executive photo (admin only, multipart/form-data)

#### Contact Info
- `GET /api/cms/contact-info` - Get contact information (public)
- `PUT /api/cms/contact-info` - Update contact information (admin only)

**📄 Full API Spec:** See `BACKEND_CMS_SPEC.md` file for complete request/response examples.

## Important Implementation Details

### ✅ Singleton Pattern
The `home_content`, `about_content`, and `contact_info` tables should **only ever have 1 row**. Use UPDATE, not INSERT for these tables (except initial setup).

### ✅ Authentication
- **Public endpoints** (GET): No authentication required
- **Admin endpoints** (PUT/POST/DELETE): Require JWT auth + admin role check
- Use your existing authentication middleware

### ✅ Field Naming Convention
- **Database:** Use `snake_case` (e.g., `hero_title_en`)
- **API Response:** Use `camelCase` (e.g., `heroTitleEn`)
- Add a transformation layer to convert between them

### ✅ Image Handling
For executive photos and hero image, you can either:
- Store as base64 string in database (simpler, recommended for small images)
- Save files to `/uploads` directory and store file path in database

Either approach works - choose what's easier for you.

### ✅ Validation
Add validation for:
- Required fields
- Text length limits
- Email format validation
- URL format validation for social media links
- Image file size limits (max 5MB)

### ✅ JSON Fields
Some fields store JSON arrays (e.g., values, objectives, departments). In PostgreSQL, use `JSONB` type.

Example:
```json
{
  "valuesEn": ["Humanity", "Commitment", "Democratic Culture"],
  "valuesAm": ["ሰበዓዊነት", "ቁርጠኝነት", "የዲሞክራሲ ባህል"]
}
```

## Testing

After implementation:
1. Test all endpoints with Postman
2. Verify authentication works (public vs admin endpoints)
3. Verify singleton pattern (only 1 row in content tables)
4. Test image uploads work correctly
5. Share the Postman collection with me

## Deliverables

Please provide:
1. ✅ SQL migration script with CREATE TABLE statements
2. ✅ SQL script with default/initial data INSERT statements
3. ✅ Implemented API endpoints (all 15 endpoints listed above)
4. ✅ Postman collection for testing the new endpoints
5. ✅ Confirmation that all endpoints are deployed and working

## Reference Files

- **Full Specification:** `BACKEND_CMS_SPEC.md` (detailed database schema and API documentation)
- **Frontend Default Data:** `src/config/content.ts` (contains default content values)

## Questions?

If anything is unclear:
- Check the `BACKEND_CMS_SPEC.md` file for detailed specifications
- Ask me for clarification on any specific requirement
- I can provide sample SQL INSERT statements if needed

---

**Priority:** High  
**Estimated Time:** 4-6 hours  
**Complexity:** Medium

Let me know when the endpoints are ready and I'll integrate them into the frontend! 🚀

