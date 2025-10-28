# CMS Complete Fix

## Problem
CMS endpoints were returning 500 errors due to mismatches between Sequelize models and database table schemas:
- Missing fields in tables
- Wrong data types
- Field name mismatches

## Errors Fixed

### 1. about_content table
- Missing: `updated_by` field
- Fixed: Added `updated_by INT` to table creation

### 2. contact_info table  
**Missing Fields**: phone2, fax, po_box, map_url, latitude, longitude, telegram_url, youtube_url, updated_by
**Wrong Data Types**: address_en, address_am, working_hours_en, working_hours_am should be TEXT, not VARCHAR

### 3. executives table
- Wrong field name: `photo_filename` should be `image`
- Missing: `created_by` field
- Fixed: Both issues resolved

## Files Updated

### `src/scripts/simple-reset.js`

All CMS tables now have complete and correct field definitions matching the Sequelize models.

## Solution

**You MUST reset the database** to apply these changes:

```bash
npm run db:reset
```

This will:
1. Drop all existing tables
2. Recreate them with the correct schema
3. Seed the admin account
4. The CMS endpoints will then work properly

## After Reset

All CMS endpoints should work:
- ✅ `/api/cms/home-content` 
- ✅ `/api/cms/about-content`
- ✅ `/api/cms/executives?type=executive`
- ✅ `/api/cms/executives?type=expert`
- ✅ `/api/cms/contact-info`

## Note

The old database still has the incorrect schema. You cannot just restart the server - you MUST run `npm run db:reset` for the fixes to take effect.

