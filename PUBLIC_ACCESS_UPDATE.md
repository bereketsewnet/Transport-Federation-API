# Public Access Update - Galleries, Photos & News

## 🔓 Changes Made

I've updated the API to make **reading** galleries, photos, and news **publicly accessible** (no authentication required), while keeping **admin privileges** for create, update, and delete operations.

## 📋 Updated Routes

### 🖼️ **Galleries** (`/api/galleries`)

#### ✅ **Public Routes (No Auth Required):**
- `GET /api/galleries` - List all galleries
- `GET /api/galleries/:id` - Get gallery by ID (with photos)

#### 🔒 **Admin Routes (Auth + Admin Role Required):**
- `POST /api/galleries` - Create new gallery
- `PUT /api/galleries/:id` - Update gallery
- `DELETE /api/galleries/:id` - Delete gallery

### 📸 **Photos** (`/api/photos`)

#### ✅ **Public Routes (No Auth Required):**
- `GET /api/photos` - List photos (with gallery_id filter)
- `GET /api/photos/:id` - Get photo by ID

#### 🔒 **Admin Routes (Auth + Admin Role Required):**
- `POST /api/photos` - Upload photo (file or URL)
- `PUT /api/photos/:id` - Update photo
- `DELETE /api/photos/:id` - Delete photo

### 📰 **News** (`/api/news`)

#### ✅ **Public Routes (No Auth Required):**
- `GET /api/news` - List news (with filters)
- `GET /api/news/:id` - Get news by ID

#### 🔒 **Admin Routes (Auth + Admin Role Required):**
- `POST /api/news` - Create news (with image)
- `PUT /api/news/:id` - Update news (with image)
- `DELETE /api/news/:id` - Delete news

## 🧪 Testing Examples

### Test 1: List Galleries (Public - No Auth)

```bash
curl -X GET http://localhost:4000/api/galleries
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Conference 2025",
      "description": "Photos from the annual conference",
      "created_at": "2025-10-18T..."
    }
  ],
  "meta": {
    "total": 1
  }
}
```

### Test 2: Get Gallery with Photos (Public - No Auth)

```bash
curl -X GET http://localhost:4000/api/galleries/1
```

**Response:**
```json
{
  "gallery": {
    "id": 1,
    "title": "Conference 2025",
    "description": "Photos from the annual conference"
  },
  "photos": [
    {
      "id": 1,
      "gallery_id": 1,
      "filename": "photo-123456789.jpg",
      "caption": "Opening ceremony",
      "is_local": true,
      "image_url": "/uploads/photos/photo-123456789.jpg"
    }
  ]
}
```

### Test 3: List Photos (Public - No Auth)

```bash
curl -X GET "http://localhost:4000/api/photos?gallery_id=1"
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "gallery_id": 1,
      "filename": "photo-123456789.jpg",
      "caption": "Opening ceremony",
      "is_local": true,
      "image_url": "/uploads/photos/photo-123456789.jpg"
    }
  ],
  "meta": {
    "total": 1
  }
}
```

### Test 4: List News (Public - No Auth)

```bash
curl -X GET "http://localhost:4000/api/news?is_published=true"
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Annual Conference 2025",
      "body": "Conference details...",
      "summary": "Conference highlights",
      "is_published": true,
      "image_filename": "news-123456789.jpg",
      "is_local": true,
      "image_url": "/uploads/news/news-123456789.jpg"
    }
  ],
  "meta": {
    "total": 1
  }
}
```

### Test 5: Get News by ID (Public - No Auth)

```bash
curl -X GET http://localhost:4000/api/news/1
```

**Response:**
```json
{
  "id": 1,
  "title": "Annual Conference 2025",
  "body": "Conference details...",
  "summary": "Conference highlights",
  "is_published": true,
  "image_filename": "news-123456789.jpg",
  "is_local": true,
  "image_url": "/uploads/news/news-123456789.jpg"
}
```

## 🔒 Admin Operations Still Require Auth

### Create Gallery (Admin Only)

```bash
curl -X POST http://localhost:4000/api/galleries \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Gallery",
    "description": "Gallery description"
  }'
```

### Upload Photo (Admin Only)

```bash
curl -X POST http://localhost:4000/api/photos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "gallery_id=1" \
  -F "caption=New photo" \
  -F "photo=@/path/to/image.jpg"
```

### Create News (Admin Only)

```bash
curl -X POST http://localhost:4000/api/news \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New News Article",
    "body": "Article content",
    "is_published": true
  }'
```

## 📱 Frontend Integration

### Public Gallery Page (No Auth Required)

```javascript
// React example - Public gallery page
function PublicGallery() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No authentication required!
    fetch('http://localhost:4000/api/galleries')
      .then(res => res.json())
      .then(data => {
        setGalleries(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading galleries:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading galleries...</div>;

  return (
    <div>
      <h1>Photo Galleries</h1>
      {galleries.map(gallery => (
        <div key={gallery.id}>
          <h2>{gallery.title}</h2>
          <p>{gallery.description}</p>
          <a href={`/gallery/${gallery.id}`}>View Photos</a>
        </div>
      ))}
    </div>
  );
}
```

### Public News Page (No Auth Required)

```javascript
// React example - Public news page
function PublicNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No authentication required!
    fetch('http://localhost:4000/api/news?is_published=true')
      .then(res => res.json())
      .then(data => {
        setNews(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading news:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading news...</div>;

  return (
    <div>
      <h1>Latest News</h1>
      {news.map(article => (
        <div key={article.id}>
          {article.image_url && (
            <img src={`http://localhost:4000${article.image_url}`} alt={article.title} />
          )}
          <h2>{article.title}</h2>
          <p>{article.summary}</p>
          <a href={`/news/${article.id}`}>Read More</a>
        </div>
      ))}
    </div>
  );
}
```

### Admin Panel (Auth Required)

```javascript
// React example - Admin panel
function AdminPanel() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const createNews = async (newsData) => {
    const response = await fetch('http://localhost:4000/api/news', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newsData)
    });

    if (!response.ok) {
      throw new Error('Failed to create news');
    }

    return response.json();
  };

  // Admin functions require authentication
  return (
    <div>
      <h1>Admin Panel</h1>
      {/* Admin forms and controls */}
    </div>
  );
}
```

## 🎯 Benefits

### ✅ **For Public Users:**
- Can view galleries without login
- Can browse photos without authentication
- Can read published news without account
- Better user experience for website visitors

### ✅ **For Admins:**
- Still have full control over content
- Can create, update, and delete content
- Authentication still required for modifications
- Security maintained for admin operations

### ✅ **For Developers:**
- Simpler frontend implementation for public pages
- No need to handle authentication for read operations
- Clear separation between public and admin functionality
- Better performance (no auth checks for reads)

## 📋 Updated Postman Collection

The Postman collection has been updated to reflect these changes:

- **Public endpoints** are marked with "(public)" in the name
- **No Authorization header** required for GET requests
- **Authorization still required** for POST, PUT, DELETE operations

## 🔧 Files Modified

1. **`src/routes/galleries.routes.js`** - Made GET routes public
2. **`src/routes/photos.routes.js`** - Made GET routes public  
3. **`src/routes/news.routes.js`** - Made GET routes public
4. **`postman_endpoint.json`** - Updated collection with public endpoints

## 🚀 Ready to Use!

The changes are **immediately effective**. You can now:

1. **Test public access** - Try the GET endpoints without authentication
2. **Update your frontend** - Remove auth requirements for read operations
3. **Keep admin security** - Admin operations still require authentication

**Example public URLs:**
- `http://localhost:4000/api/galleries`
- `http://localhost:4000/api/photos?gallery_id=1`
- `http://localhost:4000/api/news?is_published=true`

**Perfect for public websites and mobile apps!** 🎉
