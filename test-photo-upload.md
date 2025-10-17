# Testing Photo Upload System

## ✅ Migration Completed

The database has been successfully migrated with the `is_local` column added to the `photos` table.

## 🧪 Test the Photo Upload

### Step 1: Start the Server

```bash
npm run dev
```

### Step 2: Login to Get JWT Token

**Request:**
```bash
curl -X POST http://localhost:4000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

**Copy the token from the response.**

### Step 3: Test File Upload (Method 1)

**Using PowerShell:**
```powershell
# Create a test FormData request
$token = "YOUR_JWT_TOKEN_HERE"
$uri = "http://localhost:4000/api/photos"

$form = @{
    photo = Get-Item -Path "path\to\your\image.jpg"
    gallery_id = "1"
    caption = "Test upload"
    taken_at = "2025-10-17"
}

Invoke-RestMethod -Uri $uri -Method Post -Form $form -Headers @{
    "Authorization" = "Bearer $token"
}
```

**Or using Postman:**
1. Open Postman
2. Import `postman_endpoint.json`
3. Set `jwt_token` variable with your token
4. Go to "Upload photo file (admin)"
5. In Body tab, select file for `photo` field
6. Click Send

### Step 4: Test URL Upload (Method 2)

**Using PowerShell:**
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$uri = "http://localhost:4000/api/photos"

$body = @{
    gallery_id = 1
    image_url = "https://picsum.photos/800/600"
    caption = "External image from Lorem Picsum"
    taken_at = "2025-10-17"
} | ConvertTo-Json

Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType "application/json" -Headers @{
    "Authorization" = "Bearer $token"
}
```

**Or using curl (PowerShell):**
```powershell
curl.exe -X POST http://localhost:4000/api/photos `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"gallery_id\":1,\"image_url\":\"https://picsum.photos/800/600\",\"caption\":\"Test URL\",\"taken_at\":\"2025-10-17\"}'
```

### Step 5: List Photos

```bash
curl -X GET http://localhost:4000/api/photos?gallery_id=1 ^
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 6: Access Uploaded Photo

If you uploaded a file in Step 3, access it at:
```
http://localhost:4000/uploads/photos/photo-1729178564123-987654321.jpg
```

(Use the filename from the response)

## 📋 Expected Responses

### File Upload Response
```json
{
  "id": 1,
  "gallery_id": 1,
  "filename": "photo-1729178564123-987654321.jpg",
  "caption": "Test upload",
  "taken_at": "2025-10-17",
  "is_local": true,
  "image_url": "/uploads/photos/photo-1729178564123-987654321.jpg",
  "created_at": "2025-10-17T10:30:45.000Z"
}
```

### URL Upload Response
```json
{
  "id": 2,
  "gallery_id": 1,
  "filename": "https://picsum.photos/800/600",
  "caption": "External image from Lorem Picsum",
  "taken_at": "2025-10-17",
  "is_local": false,
  "created_at": "2025-10-17T10:31:20.000Z"
}
```

## 🎯 What to Check

- ✅ File uploads are saved to `uploads/photos/` directory
- ✅ Uploaded files are accessible at `/uploads/photos/{filename}`
- ✅ `is_local` is `true` for file uploads
- ✅ `is_local` is `false` for URL strings
- ✅ File size validation (max 5MB)
- ✅ File type validation (only images)
- ✅ Both methods work with same endpoint

## 🐛 Troubleshooting

### Error: "Either upload a photo file or provide an image_url"
- Make sure you're sending either `photo` file OR `image_url` field

### Error: "File size too large"
- Your file exceeds 5MB limit
- Compress the image or use a smaller file

### Error: "Only image files are allowed"
- Upload only: jpeg, jpg, png, gif, webp files

### Error: "Cannot find module 'multer'"
- Run: `npm install multer`

### 404 when accessing uploaded photo
- Check if file exists in `uploads/photos/` directory
- Verify the filename in the response
- Make sure server is running

## ✨ Success Indicators

1. **File Upload:**
   - Response includes `image_url` field
   - File appears in `uploads/photos/` directory
   - File accessible at `/uploads/photos/{filename}`
   - `is_local` is `true`

2. **URL Upload:**
   - Response includes the URL in `filename` field
   - No file created in uploads directory
   - `is_local` is `false`

## 🎉 You're Done!

Your photo upload system is working if:
- ✅ Both upload methods return success
- ✅ Files are accessible via URL
- ✅ Database records have correct `is_local` values
- ✅ Validations work (file size, type)

Need help? Check `PHOTO_UPLOAD_GUIDE.md` for detailed documentation.

