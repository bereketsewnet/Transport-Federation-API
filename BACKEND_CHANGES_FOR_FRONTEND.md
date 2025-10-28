# Backend Changes for Frontend Integration

## 🆕 New Features Added

### 1. OSH (Occupational Safety and Health) Incidents System
**Complete CRUD system for workplace incident management**

#### New API Endpoints:
- `GET /api/osh-incidents` - List incidents (public)
- `GET /api/osh-incidents/:id` - Get incident by ID (public)
- `POST /api/osh-incidents` - Create incident (admin only)
- `PUT /api/osh-incidents/:id` - Update incident (admin only)
- `DELETE /api/osh-incidents/:id` - Delete incident (admin only)
- `GET /api/osh-incidents/statistics` - Get statistics (public)

#### New OSH Reports Endpoints:
- `GET /api/reports/osh-summary` - Summary report (admin only)
- `GET /api/reports/osh-high-severity` - High severity incidents (admin only)
- `GET /api/reports/osh-regulatory-reports` - Regulatory reports (admin only)
- `GET /api/reports/osh-monthly-trends` - Monthly trends (admin only)
- `GET /api/reports/osh-root-causes` - Root cause analysis (admin only)

### 2. CMS (Content Management System) Updates
**Enhanced content management for website pages**

#### Updated CMS Endpoints:
- All CMS endpoints now support image uploads
- Hero images for homepage
- Executive photos for about page
- Bilingual content support (English/Amharic)

### 3. Public Access Updates
**Made certain endpoints publicly accessible**

#### Now Public (No Authentication Required):
- `GET /api/news` - List news articles
- `GET /api/news/:id` - Get news by ID
- `GET /api/galleries` - List galleries
- `GET /api/galleries/:id` - Get gallery by ID
- `GET /api/photos` - List photos
- `GET /api/photos/:id` - Get photo by ID
- `GET /api/cms/*` - All CMS content endpoints
- `GET /api/osh-incidents` - List OSH incidents
- `GET /api/osh-incidents/statistics` - OSH statistics

## 📊 OSH Incident Data Structure

### Incident Fields:
```json
{
  "id": 1,
  "unionId": 1,
  "accidentCategory": "People", // or "Property/Asset"
  "dateTimeOccurred": "2024-10-18T10:30:00.000Z",
  "locationSite": "Main Office Building",
  "locationBuilding": "Building A",
  "locationArea": "Ground Floor",
  "locationGpsLatitude": 9.0320,
  "locationGpsLongitude": 38.7469,
  "injurySeverity": "Minor", // Near-Miss, FAC, MTC, RWC, Major, Fatal, None
  "damageSeverity": "None", // Minor, Moderate, Major, Severe/Critical, None
  "rootCauseUnsafeAct": true,
  "rootCauseEquipmentFailure": false,
  "rootCauseEnvironmental": false,
  "rootCauseOther": null,
  "description": "Employee slipped on wet floor",
  "regulatoryReportRequired": false,
  "regulatoryReportDate": null,
  "status": "open", // open, investigating, action_pending, closed
  "reportedBy": "Safety Officer",
  "reportedDate": "2024-10-18T10:30:00.000Z",
  "investigationNotes": "Initial investigation completed",
  "correctiveActions": "Install non-slip mats",
  "preventiveMeasures": "Regular floor cleaning schedule",
  "createdAt": "2024-10-18T10:30:00.000Z",
  "updatedAt": "2024-10-18T10:30:00.000Z",
  "createdBy": 1,
  "updatedBy": 1,
  "rootCauses": ["Unsafe Act"] // Array of root causes
}
```

## 🎯 Frontend Implementation Recommendations

### 1. OSH Incidents Dashboard
Create a comprehensive dashboard with:
- **Incident List**: Table with filtering by union, category, severity, status
- **Statistics Cards**: Total incidents, by category, by severity
- **Charts**: Monthly trends, root cause analysis
- **Forms**: Create/Edit incident forms with all required fields
- **Maps**: GPS location display for incidents

### 2. Enhanced News Management
- **Image Upload**: Support for both file upload and URL input
- **Image Preview**: Show uploaded images in news list
- **Public Display**: News page accessible without login

### 3. CMS Content Management
- **Homepage Editor**: Hero section, statistics, overview content
- **About Page Editor**: Executive profiles with photos
- **Contact Info Editor**: Contact details management
- **Bilingual Support**: English/Amharic content switching

## 📁 Files to Upload for Better Functionality

### 1. Image Assets
Upload these to your frontend `public/images/` folder:

```
public/images/
├── osh/
│   ├── incident-icons/
│   │   ├── people-incident.svg
│   │   ├── property-incident.svg
│   │   ├── near-miss.svg
│   │   ├── minor-injury.svg
│   │   ├── major-injury.svg
│   │   └── fatal-injury.svg
│   └── severity-indicators/
│       ├── low-severity.svg
│       ├── medium-severity.svg
│       ├── high-severity.svg
│       └── critical-severity.svg
├── cms/
│   ├── hero-placeholder.jpg
│   ├── executive-placeholder.jpg
│   └── content-icons/
│       ├── home-icon.svg
│       ├── about-icon.svg
│       └── contact-icon.svg
└── news/
    ├── news-placeholder.jpg
    └── category-icons/
        ├── general.svg
        ├── announcement.svg
        └── event.svg
```

### 2. Component Templates
Create these React/Vue components:

```
components/
├── osh/
│   ├── IncidentForm.jsx
│   ├── IncidentList.jsx
│   ├── IncidentCard.jsx
│   ├── StatisticsCards.jsx
│   ├── SeverityChart.jsx
│   ├── RootCauseChart.jsx
│   └── MonthlyTrendsChart.jsx
├── cms/
│   ├── HomepageEditor.jsx
│   ├── AboutPageEditor.jsx
│   ├── ContactEditor.jsx
│   ├── ExecutiveForm.jsx
│   └── ImageUploader.jsx
└── news/
    ├── NewsForm.jsx
    ├── NewsList.jsx
    ├── NewsCard.jsx
    └── ImageUploader.jsx
```

### 3. API Service Files
Create these service files:

```
services/
├── oshService.js
├── cmsService.js
├── newsService.js
└── uploadService.js
```

## 🔧 API Integration Examples

### OSH Incidents Service
```javascript
// services/oshService.js
export const oshService = {
  // Get all incidents
  getIncidents: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetch(`/api/osh-incidents?${params}`).then(res => res.json());
  },
  
  // Create incident
  createIncident: (data) => {
    return fetch('/api/osh-incidents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    }).then(res => res.json());
  },
  
  // Get statistics
  getStatistics: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return fetch(`/api/osh-incidents/statistics?${params}`).then(res => res.json());
  }
};
```

### CMS Service
```javascript
// services/cmsService.js
export const cmsService = {
  // Get homepage content
  getHomeContent: () => {
    return fetch('/api/cms/home').then(res => res.json());
  },
  
  // Update homepage content
  updateHomeContent: (data) => {
    return fetch('/api/cms/home', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    }).then(res => res.json());
  }
};
```

## 🎨 UI/UX Recommendations

### 1. OSH Dashboard Layout
```
┌─────────────────────────────────────────────────────────┐
│ OSH Incidents Dashboard                                 │
├─────────────────────────────────────────────────────────┤
│ [Statistics Cards Row]                                  │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│ │ Total   │ │ People  │ │ Property│ │ Open    │      │
│ │ 25      │ │ 18      │ │ 7       │ │ 12      │      │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
├─────────────────────────────────────────────────────────┤
│ [Charts Row]                                            │
│ ┌─────────────────┐ ┌─────────────────┐              │
│ │ Monthly Trends   │ │ Root Causes     │              │
│ │ [Chart]          │ │ [Pie Chart]     │              │
│ └─────────────────┘ └─────────────────┘              │
├─────────────────────────────────────────────────────────┤
│ [Incidents Table]                                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ID │ Date │ Union │ Category │ Severity │ Status │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2. Color Coding for Severity
- **Green**: Near-Miss, None
- **Yellow**: Minor, First Aid Case
- **Orange**: Moderate, Medical Treatment Case
- **Red**: Major, Restricted Work Case
- **Dark Red**: Fatal, Permanent Disability

### 3. Form Validation
- **Required Fields**: Union ID, Accident Category, Date, Description
- **Date Validation**: Cannot be future date
- **GPS Validation**: Latitude (-90 to 90), Longitude (-180 to 180)
- **File Upload**: Max 5MB, Image formats only

## 🚀 Quick Start Guide

1. **Install Dependencies**: Add chart libraries (Chart.js, D3.js)
2. **Create Services**: Set up API service files
3. **Build Components**: Start with OSH incident list component
4. **Add Routing**: Set up routes for OSH dashboard
5. **Test Integration**: Use Postman collection for testing

## 📞 Support

For any questions about the API integration:
- Check the `ENDPOINTS_EXAMPLES.md` file for detailed API documentation
- Use the Postman collection `postman_endpoint.json` for testing
- All endpoints return consistent JSON responses with proper error handling

---

**Last Updated**: October 2024
**Backend Version**: 2.0.0
**New Features**: OSH Incidents, Enhanced CMS, Public Access
