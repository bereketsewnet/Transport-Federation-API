# Reports API - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Import Postman Collection
1. Open Postman
2. File → Import
3. Select `postman_reports_collection.json`
4. Done! You now have all 25 endpoints

### Step 2: Login & Get Token
```bash
POST http://localhost:4000/api/auth/login
Body: {
  "username": "admin",
  "password": "ChangeThisStrongAdminPass!"
}
```

Copy the `token` from response.

### Step 3: Set Token in Postman
- Click "Collections"
- Select "TCWF Reports API Collection"
- Click "Variables" tab
- Set `jwt_token` value to your token
- Save

### Step 4: Test Your First Report
- Open "Member Statistics" folder
- Click "Members Summary"
- Click "Send"
- See the results! 🎉

---

## 📊 All 21 Reports at a Glance

### 1. Members Summary
`GET /api/reports/members-summary`
→ Male/Female/Total by year

### 2. Unions Summary
`GET /api/reports/unions-summary`
→ Total + by sector + by organization

### 3. Executives Remaining Days
`GET /api/reports/executives-remaining-days`
→ All executives with days left in term

### 4. Executives Expiring Before Date
`GET /api/reports/executives-expiring-before?date=2025-12-31`
→ Filter by expiration date

### 5. Executives by Union
`GET /api/reports/executives-by-union?union_id=1`
→ Count for specific union (Male/Female)

### 6. Members Under 35
`GET /api/reports/members-under-35`
→ Youth members (Male/Female/Total)

### 7. Members Above 35
`GET /api/reports/members-above-35`
→ Senior members (Male/Female/Total)

### 8. Unions CBA Status
`GET /api/reports/unions-cba-status`
→ With/Without CBA counts

### 9. Unions Without CBA
`GET /api/reports/unions-without-cba`
→ List of unions needing CBA

### 10. Unions with Expired CBA
`GET /api/reports/unions-cba-expired`
→ CBAs that have expired

### 11. Unions with CBA Expiring Soon
`GET /api/reports/unions-cba-expiring-soon?days=90`
→ CBAs expiring within X days

### 12. Unions with Ongoing CBA
`GET /api/reports/unions-cba-ongoing`
→ All active CBAs

### 13. General Assembly Status
`GET /api/reports/unions-general-assembly-status`
→ Conducted vs not conducted

### 14. Unions Without Assembly
`GET /api/reports/unions-no-general-assembly`
→ List of unions without assembly

### 15. Unions Assembly on Date
`GET /api/reports/unions-assembly-on-date?date=2024-01-01`
→ Assemblies on specific date

### 16. Unions with Recent Assembly
`GET /api/reports/unions-assembly-recent?months=3`
→ Assemblies within X months

### 17. Terminated Unions Count
`GET /api/reports/terminated-unions-count`
→ Total + by sector

### 18. Terminated Unions List
`GET /api/reports/terminated-unions-list`
→ Full list with details

### BONUS: Cache Management
- `POST /api/reports/cache` - Save report
- `GET /api/reports/cache` - List cached
- `GET /api/reports/cache/:id` - Get one
- `DELETE /api/reports/cache/:id?confirm=true` - Delete

---

## 🎯 Most Common Use Cases

### Dashboard Cards
```javascript
// Get data for 4 main cards
const members = await GET('/api/reports/members-summary');
const unions = await GET('/api/reports/unions-summary');
const cba = await GET('/api/reports/unions-cba-status');
const assembly = await GET('/api/reports/unions-general-assembly-status');

// Display:
// Card 1: members.summary.grand_total
// Card 2: unions.total_unions
// Card 3: cba.percentage_with_cba + "%"
// Card 4: assembly.percentage_conducted + "%"
```

### Charts
```javascript
// Member growth line chart
const data = await GET('/api/reports/members-summary');
const chartData = data.by_year; // Ready for Chart.js!

// Union distribution pie chart
const unions = await GET('/api/reports/unions-summary');
const pieData = unions.by_sector; // Ready for pie chart!
```

### Alerts
```javascript
// Show CBA expiration alerts
const expiring = await GET('/api/reports/unions-cba-expiring-soon?days=30');
if (expiring.count > 0) {
  alert(`⚠️ ${expiring.count} CBAs expiring in 30 days!`);
}
```

### Tables
```javascript
// Show list of unions without CBA
const noCBA = await GET('/api/reports/unions-without-cba');
const tableRows = noCBA.data.map(union => ({
  name: union.name_en,
  sector: union.sector,
  established: union.established_date
}));
```

---

## 🔑 Quick Reference

### Base URL
```
http://localhost:4000/api/reports
```

### Authorization Header
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Date Format
```
YYYY-MM-DD (e.g., 2025-12-31)
```

### Common Query Params
- `date` - Specific date (YYYY-MM-DD)
- `days` - Number of days (e.g., 90)
- `months` - Number of months (e.g., 3)
- `union_id` - Union ID (e.g., 1)

---

## 📱 Example cURL Commands

### Get Members Summary
```bash
curl -X GET http://localhost:4000/api/reports/members-summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get CBA Expiring in 60 Days
```bash
curl -X GET "http://localhost:4000/api/reports/unions-cba-expiring-soon?days=60" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Executives for Union 5
```bash
curl -X GET "http://localhost:4000/api/reports/executives-by-union?union_id=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Troubleshooting

### "No token provided"
→ Add Authorization header with Bearer token

### "Requires admin role"
→ Login with admin account

### "date parameter required"
→ Add `?date=2025-12-31` to URL

### "union_id parameter required"
→ Add `?union_id=1` to URL

### Empty data array
→ Check if you have data in database (members, unions, etc.)

---

## 📚 Full Documentation

For complete details on all endpoints:
- **API Documentation:** `REPORTS_ENDPOINTS_DOCUMENTATION.md` (600+ lines)
- **Implementation Summary:** `REPORTS_IMPLEMENTATION_SUMMARY.md`
- **Postman Collection:** `postman_reports_collection.json`

---

## ✅ Quick Checklist

- [ ] Imported Postman collection
- [ ] Got admin JWT token
- [ ] Set token in Postman variables
- [ ] Tested members-summary endpoint
- [ ] Tested unions-summary endpoint
- [ ] Tested at least 5 more endpoints
- [ ] Shared documentation with UI team
- [ ] Ready to build frontend!

---

## 🎉 You're All Set!

All 21 reports are working and ready to use.

**Next Steps:**
1. Test all endpoints in Postman
2. Give `REPORTS_ENDPOINTS_DOCUMENTATION.md` to your UI developer
3. Build amazing dashboards and charts!

Need help? Check the full documentation files. 🚀

