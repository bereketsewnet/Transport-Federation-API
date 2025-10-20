# Backend CMS API Specification

## Overview
This document provides the database schema and API endpoints needed to move the frontend CMS functionality from localStorage to backend database storage. This will enable admin users to edit Home Page content, About Page content, and Contact Information through the admin panel with data persisted in the database.

---

## Database Schema

### 1. `home_content` Table
Stores editable content for the home page (hero section, statistics, overview).

```sql
CREATE TABLE home_content (
  id SERIAL PRIMARY KEY,
  
  -- Hero Section
  hero_title_en TEXT NOT NULL,
  hero_title_am TEXT NOT NULL,
  hero_subtitle_en TEXT NOT NULL,
  hero_subtitle_am TEXT NOT NULL,
  
  -- Overview Section
  overview_en TEXT NOT NULL,
  overview_am TEXT NOT NULL,
  
  -- Statistics (4 stats)
  stat1_label_en VARCHAR(100) DEFAULT 'Active Members',
  stat1_label_am VARCHAR(100) DEFAULT 'ንቁ አባላት',
  stat1_value INTEGER DEFAULT 1250,
  
  stat2_label_en VARCHAR(100) DEFAULT 'Worker Unions',
  stat2_label_am VARCHAR(100) DEFAULT 'የሰራተኛ ማህበራት',
  stat2_value INTEGER DEFAULT 19,
  
  stat3_label_en VARCHAR(100) DEFAULT 'Years of Service',
  stat3_label_am VARCHAR(100) DEFAULT 'የአገልግሎት ዓመታት',
  stat3_value INTEGER DEFAULT 50,
  
  stat4_label_en VARCHAR(100) DEFAULT 'Protection Rate (%)',
  stat4_label_am VARCHAR(100) DEFAULT 'የጥበቃ መጠን (%)',
  stat4_value INTEGER DEFAULT 100,
  
  -- Hero Image (optional - base64 or file path)
  hero_image TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES login_accounts(id)
);

-- Only one row should exist (singleton pattern)
CREATE UNIQUE INDEX idx_home_content_singleton ON home_content ((TRUE));
```

### 2. `about_content` Table
Stores editable text content for the about page.

```sql
CREATE TABLE about_content (
  id SERIAL PRIMARY KEY,
  
  -- Mission & Vision
  mission_en TEXT NOT NULL,
  mission_am TEXT NOT NULL,
  vision_en TEXT NOT NULL,
  vision_am TEXT NOT NULL,
  
  -- Values (stored as JSON array)
  values_en JSONB DEFAULT '[]'::jsonb, -- Array of strings
  values_am JSONB DEFAULT '[]'::jsonb, -- Array of strings
  
  -- History
  history_en TEXT NOT NULL,
  history_am TEXT NOT NULL,
  
  -- Objectives (stored as JSON array)
  objectives_en JSONB DEFAULT '[]'::jsonb, -- Array of strings
  objectives_am JSONB DEFAULT '[]'::jsonb, -- Array of strings
  
  -- Structure
  structure_title_en VARCHAR(200),
  structure_title_am VARCHAR(200),
  structure_departments_en JSONB DEFAULT '[]'::jsonb, -- Array of strings
  structure_departments_am JSONB DEFAULT '[]'::jsonb, -- Array of strings
  
  -- Stakeholders
  stakeholders_title_en VARCHAR(200),
  stakeholders_title_am VARCHAR(200),
  stakeholders_list_en JSONB DEFAULT '[]'::jsonb, -- Array of strings
  stakeholders_list_am JSONB DEFAULT '[]'::jsonb, -- Array of strings
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES login_accounts(id)
);

-- Only one row should exist (singleton pattern)
CREATE UNIQUE INDEX idx_about_content_singleton ON about_content ((TRUE));
```

### 3. `executives` Table
Stores executive members and experts with photos.

```sql
CREATE TABLE executives (
  id SERIAL PRIMARY KEY,
  
  -- Names
  name_en VARCHAR(200) NOT NULL,
  name_am VARCHAR(200) NOT NULL,
  
  -- Position/Title
  position_en VARCHAR(200) NOT NULL,
  position_am VARCHAR(200) NOT NULL,
  
  -- Bio (optional)
  bio_en TEXT,
  bio_am TEXT,
  
  -- Photo (base64 encoded image or file path)
  image TEXT,
  
  -- Type: 'executive' or 'expert' (for carousel)
  type VARCHAR(20) NOT NULL DEFAULT 'executive',
  
  -- Display order
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES login_accounts(id)
);

CREATE INDEX idx_executives_type ON executives(type);
CREATE INDEX idx_executives_order ON executives(display_order);
```

### 4. `contact_info` Table
Stores contact information (replaces .env variables).

```sql
CREATE TABLE contact_info (
  id SERIAL PRIMARY KEY,
  
  -- Contact Details
  address_en TEXT NOT NULL,
  address_am TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  phone2 VARCHAR(50), -- Additional phone
  email VARCHAR(100) NOT NULL,
  fax VARCHAR(50),
  po_box VARCHAR(50),
  
  -- Location
  map_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Social Media
  facebook_url VARCHAR(200),
  twitter_url VARCHAR(200),
  linkedin_url VARCHAR(200),
  telegram_url VARCHAR(200),
  youtube_url VARCHAR(200),
  
  -- Working Hours
  working_hours_en TEXT,
  working_hours_am TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES login_accounts(id)
);

-- Only one row should exist (singleton pattern)
CREATE UNIQUE INDEX idx_contact_info_singleton ON contact_info ((TRUE));
```

---

## API Endpoints

### 1. Home Content Endpoints

#### GET `/api/cms/home-content`
Get the home page content.

**Authentication:** None (Public)

**Response:**
```json
{
  "data": {
    "id": 1,
    "heroTitleEn": "Transport & Communication Workers Federation",
    "heroTitleAm": "የትራንስፖርትና መገናኛ ሠራተኞች ማኅበራት ፌዴሬሽን",
    "heroSubtitleEn": "Empowering workers across Ethiopia's transport...",
    "heroSubtitleAm": "በኢትዮጵያ የትራንስፖርትና መገናኛ...",
    "overviewEn": "The Industrial Federation of...",
    "overviewAm": "የትራንስፖርትና መገናኛ...",
    "stat1LabelEn": "Active Members",
    "stat1LabelAm": "ንቁ አባላት",
    "stat1Value": 1250,
    "stat2LabelEn": "Worker Unions",
    "stat2LabelAm": "የሰራተኛ ማህበራት",
    "stat2Value": 19,
    "stat3LabelEn": "Years of Service",
    "stat3LabelAm": "የአገልግሎት ዓመታት",
    "stat3Value": 50,
    "stat4LabelEn": "Protection Rate (%)",
    "stat4LabelAm": "የጥበቃ መጠን (%)",
    "stat4Value": 100,
    "heroImage": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT `/api/cms/home-content`
Update home page content.

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "heroTitleEn": "Transport & Communication Workers Federation",
  "heroTitleAm": "የትራンስፖርትና መገናኛ ሠራተኞች ማኅበራት ፌዴሬሽን",
  "heroSubtitleEn": "Empowering workers...",
  "heroSubtitleAm": "በኢትዮጵያ የትራንስፖርትና...",
  "overviewEn": "The Industrial Federation...",
  "overviewAm": "የትራንስፖርትና መገናኛ...",
  "stat1Value": 1250,
  "stat2Value": 19,
  "stat3Value": 50,
  "stat4Value": 100
}
```

**Response:**
```json
{
  "message": "Home content updated successfully",
  "data": { /* updated home content object */ }
}
```

#### POST `/api/cms/home-content/hero-image`
Upload hero image for home page.

**Authentication:** Required (Admin only)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `image`: File (jpg, png, webp)

**Response:**
```json
{
  "message": "Hero image uploaded successfully",
  "imageUrl": "/uploads/hero/hero-123456.jpg"
}
```

---

### 2. About Content Endpoints

#### GET `/api/cms/about-content`
Get the about page content.

**Authentication:** None (Public)

**Response:**
```json
{
  "data": {
    "id": 1,
    "missionEn": "To organize workers in unions...",
    "missionAm": "ሠራተኛዉን በማኅበር...",
    "visionEn": "To see workers with guaranteed...",
    "visionAm": "የሥራ ዋስትናው የተረጋገጠ...",
    "valuesEn": ["Humanity", "Commitment", "Democratic Culture"],
    "valuesAm": ["ሰበዓዊነት", "ቁርጠኝነት", "የዲሞክራሲ ባህል"],
    "historyEn": "Industrial Federation of Transport...",
    "historyAm": "የትራንስፖርትና መገናኛ...",
    "objectivesEn": ["To organize unions...", "Empowering workers..."],
    "objectivesAm": ["በአገሪቱ የአሠሪና...", "የሠራተኛውን አቅም..."],
    "structureTitleEn": "Federation Structure",
    "structureTitleAm": "የፌዴሬሽኑ አወቃቀር",
    "structureDepartmentsEn": ["President", "Secretary General"],
    "structureDepartmentsAm": ["ፕሬዝዳንት", "ዋና ፀሀፊ"],
    "stakeholdersTitleEn": "Key Stakeholders",
    "stakeholdersTitleAm": "ባለድርሻ አካላት",
    "stakeholdersListEn": ["Affiliated basic unions", "Peer Federations"],
    "stakeholdersListAm": ["በፌዴሬሽኑ ሥር የተደራጁ", "አቻ ፌዴሬሽኖች"],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT `/api/cms/about-content`
Update about page content.

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "missionEn": "To organize workers in unions...",
  "missionAm": "ሠራተኛዉን በማኅበር...",
  "visionEn": "To see workers with guaranteed...",
  "visionAm": "የሥራ ዋስትናው የተረጋገጠ...",
  "valuesEn": ["Humanity", "Commitment", "Democratic Culture"],
  "valuesAm": ["ሰበዓዊነት", "ቁርጠኝነት", "የዲሞክራሲ ባህል"],
  "historyEn": "Industrial Federation of Transport...",
  "historyAm": "የትራንስፖርትና መገናኛ...",
  "objectivesEn": ["To organize unions...", "Empowering workers..."],
  "objectivesAm": ["በአገሪቱ የአሠሪና...", "የሠራተኛውን አቅም..."],
  "structureTitleEn": "Federation Structure",
  "structureTitleAm": "የፌዴሬሽኑ አወቃቀር",
  "structureDepartmentsEn": ["President", "Secretary General"],
  "structureDepartmentsAm": ["ፕሬዝዳንት", "ዋና ፀሀፊ"],
  "stakeholdersTitleEn": "Key Stakeholders",
  "stakeholdersTitleAm": "ባለድርሻ አካላት",
  "stakeholdersListEn": ["Affiliated basic unions", "Peer Federations"],
  "stakeholdersListAm": ["በፌዴሬሽኑ ሥር የተደራጁ", "አቻ ፌዴሬሽኖች"]
}
```

**Response:**
```json
{
  "message": "About content updated successfully",
  "data": { /* updated about content object */ }
}
```

---

### 3. Executives Endpoints

#### GET `/api/cms/executives`
Get all executives and experts.

**Authentication:** None (Public)

**Query Parameters:**
- `type` (optional): Filter by type ('executive' or 'expert')
- `page` (optional): Page number
- `per_page` (optional): Items per page

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "nameEn": "Abathun Takele",
      "nameAm": "አባትሁን ታከለ",
      "positionEn": "President",
      "positionAm": "ፕሬዝዳንት",
      "bioEn": "Bio text...",
      "bioAm": "የባዮ ጽሑፍ...",
      "image": "data:image/jpeg;base64,/9j/4AAQ...",
      "type": "executive",
      "displayOrder": 1,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "per_page": 20,
    "total_pages": 1
  }
}
```

#### GET `/api/cms/executives/:id`
Get a single executive by ID.

**Authentication:** None (Public)

**Response:**
```json
{
  "data": {
    "id": 1,
    "nameEn": "Abathun Takele",
    "nameAm": "አባትሁን ታከለ",
    "positionEn": "President",
    "positionAm": "ፕሬዝዳንት",
    "bioEn": "Bio text...",
    "bioAm": "የባዮ ጽሑፍ...",
    "image": "data:image/jpeg;base64,/9j/4AAQ...",
    "type": "executive",
    "displayOrder": 1
  }
}
```

#### POST `/api/cms/executives`
Create a new executive.

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "nameEn": "John Doe",
  "nameAm": "ጆን ዶ",
  "positionEn": "Secretary General",
  "positionAm": "ዋና ፀሀፊ",
  "bioEn": "Bio text...",
  "bioAm": "የባዮ ጽሑፍ...",
  "image": "data:image/jpeg;base64,/9j/4AAQ...", // Optional base64 image
  "type": "executive", // or "expert"
  "displayOrder": 2
}
```

**Response:**
```json
{
  "message": "Executive created successfully",
  "data": { /* created executive object */ }
}
```

#### PUT `/api/cms/executives/:id`
Update an executive.

**Authentication:** Required (Admin only)

**Request Body:** (Same as POST, all fields optional)

**Response:**
```json
{
  "message": "Executive updated successfully",
  "data": { /* updated executive object */ }
}
```

#### DELETE `/api/cms/executives/:id`
Delete an executive.

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "message": "Executive deleted successfully"
}
```

#### POST `/api/cms/executives/:id/image`
Upload image for an executive.

**Authentication:** Required (Admin only)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `image`: File (jpg, png, webp)

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "imageUrl": "data:image/jpeg;base64,/9j/4AAQ..." // or file path
}
```

---

### 4. Contact Info Endpoints

#### GET `/api/cms/contact-info`
Get contact information.

**Authentication:** None (Public)

**Response:**
```json
{
  "data": {
    "id": 1,
    "addressEn": "123 Main Street, Addis Ababa, Ethiopia",
    "addressAm": "አዲስ አበባ፣ ኢትዮጵያ",
    "phone": "+251-11-XXX-XXXX",
    "phone2": "+251-11-YYY-YYYY",
    "email": "info@tcwf-ethiopia.org",
    "fax": "+251-11-ZZZ-ZZZZ",
    "poBox": "P.O. Box 1234",
    "mapUrl": "https://maps.google.com/...",
    "latitude": 9.0320,
    "longitude": 38.7469,
    "facebookUrl": "https://facebook.com/tcwf",
    "twitterUrl": "https://twitter.com/tcwf",
    "linkedinUrl": "https://linkedin.com/company/tcwf",
    "telegramUrl": "https://t.me/tcwf",
    "youtubeUrl": "https://youtube.com/tcwf",
    "workingHoursEn": "Monday - Friday: 8:30 AM - 5:00 PM",
    "workingHoursAm": "ሰኞ - አርብ: 8:30 ጠዋት - 5:00 ከሰዓት",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT `/api/cms/contact-info`
Update contact information.

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "addressEn": "123 Main Street, Addis Ababa, Ethiopia",
  "addressAm": "አዲስ አበባ፣ ኢትዮጵያ",
  "phone": "+251-11-XXX-XXXX",
  "phone2": "+251-11-YYY-YYYY",
  "email": "info@tcwf-ethiopia.org",
  "fax": "+251-11-ZZZ-ZZZZ",
  "poBox": "P.O. Box 1234",
  "mapUrl": "https://maps.google.com/...",
  "latitude": 9.0320,
  "longitude": 38.7469,
  "facebookUrl": "https://facebook.com/tcwf",
  "twitterUrl": "https://twitter.com/tcwf",
  "linkedinUrl": "https://linkedin.com/company/tcwf",
  "telegramUrl": "https://t.me/tcwf",
  "youtubeUrl": "https://youtube.com/tcwf",
  "workingHoursEn": "Monday - Friday: 8:30 AM - 5:00 PM",
  "workingHoursAm": "ሰኞ - አርብ: 8:30 ጠዋት - 5:00 ከሰዓት"
}
```

**Response:**
```json
{
  "message": "Contact info updated successfully",
  "data": { /* updated contact info object */ }
}
```

---

## Implementation Notes

### 1. **Singleton Pattern**
The `home_content`, `about_content`, and `contact_info` tables should only have ONE row each. Use the unique constraint on `(TRUE)` to enforce this. 

When updating, always UPDATE the existing row instead of INSERT:
```sql
-- Example for updating (not inserting new rows)
UPDATE home_content SET 
  hero_title_en = $1, 
  hero_title_am = $2,
  updated_at = NOW(),
  updated_by = $3
WHERE TRUE; -- Updates the single row
```

If no row exists, insert a default row on first access.

### 2. **Image Handling**
For executive/expert images, you can either:
- **Option A:** Store base64-encoded images in the database (simpler, good for small images)
- **Option B:** Save images to filesystem/S3 and store file path/URL in database (better for larger images)

Both approaches work. Base64 is simpler for your use case.

### 3. **Case Convention**
- Database uses snake_case (e.g., `hero_title_en`)
- API responses use camelCase (e.g., `heroTitleEn`)
- Add transformation layer in your backend to convert between them

### 4. **Authentication**
- GET endpoints should be public (no auth required)
- PUT/POST/DELETE endpoints require authentication and admin role
- Use your existing JWT auth middleware

### 5. **Validation**
Add validation for:
- Required fields (hero titles, mission, vision, etc.)
- Text length limits
- Image file size limits (e.g., max 5MB)
- Valid email format for contact info
- Valid URLs for social media links

### 6. **Initial Data**
After creating tables, insert default data from the frontend's `defaultAboutContent` and `defaultHomeContent` found in `src/config/content.ts`.

---

## Testing Checklist

After implementing the endpoints, test:

1. ✅ GET home content (public access)
2. ✅ PUT home content (admin only)
3. ✅ GET about content (public access)
4. ✅ PUT about content (admin only)
5. ✅ GET executives list (public access)
6. ✅ POST new executive (admin only)
7. ✅ PUT update executive (admin only)
8. ✅ DELETE executive (admin only)
9. ✅ POST executive image upload (admin only)
10. ✅ GET contact info (public access)
11. ✅ PUT contact info (admin only)
12. ✅ Verify singleton pattern (only 1 row in content tables)
13. ✅ Verify authentication/authorization works correctly

---

## Migration Path

1. Create database tables
2. Insert default data
3. Implement API endpoints
4. Test endpoints with Postman
5. Update frontend to use new endpoints instead of localStorage
6. Deploy backend changes
7. Deploy frontend changes

---

## Questions or Issues?

If you have questions about:
- Database design decisions
- API endpoint structure
- Authentication requirements
- Image handling approach

Please reach out before implementation to clarify!

