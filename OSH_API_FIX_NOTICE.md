# OSH API Field Naming Fix

## 🔧 Issue Fixed
The `accident_category` field was showing as null or empty in created incidents.

## ✅ Solution
The API now supports **both** naming conventions:
- **snake_case**: `accident_category`, `union_id`, `date_time_occurred`
- **camelCase**: `accidentCategory`, `unionId`, `dateTimeOccurred`

## 📝 Important Notes for Frontend

### **Use snake_case format for consistency**

When sending data to the API, use **snake_case** format:

```javascript
// ✅ CORRECT - Use snake_case
const incidentData = {
  union_id: 1,
  accident_category: "People",  // or "Property/Asset"
  date_time_occurred: "2024-10-18T10:30:00Z",
  location_site: "Main Office Building",
  location_building: "Building A",
  injury_severity: "Minor",
  damage_severity: "None",
  root_causes: ["Unsafe Act", "Equipment Failure"],
  description: "Employee slipped on wet floor",
  status: "open"
};
```

### **Accident Category Values**
Only these values are valid:
- `"People"` - for incidents involving people
- `"Property/Asset"` - for incidents involving property or assets

### **Example API Request**

```javascript
// POST /api/osh-incidents
fetch('/api/osh-incidents', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    union_id: 1,
    accident_category: "People",
    date_time_occurred: "2024-10-18T10:30:00Z",
    location_site: "Main Office",
    injury_severity: "Minor",
    damage_severity: "None",
    root_causes: ["Unsafe Act"],
    description: "Employee slipped on wet floor",
    regulatory_report_required: false,
    status: "open"
  })
});
```

### **Response Format**
The API returns data in **camelCase** format:

```json
{
  "data": {
    "id": 1,
    "unionId": 1,
    "accidentCategory": "People",
    "dateTimeOccurred": "2024-10-18T10:30:00Z",
    "locationSite": "Main Office Building",
    "injurySeverity": "Minor",
    "damageSeverity": "None",
    "rootCauses": ["Unsafe Act"],
    "description": "Employee slipped on wet floor",
    "status": "open"
  }
}
```

## 🎯 Summary
- **Request Format**: Use `accident_category` (snake_case)
- **Valid Values**: "People" or "Property/Asset"
- **Response Format**: Returns `accidentCategory` (camelCase)
- **Both formats are now accepted** but snake_case is recommended for consistency

