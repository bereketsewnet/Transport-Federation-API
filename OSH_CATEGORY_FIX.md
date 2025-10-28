# OSH Category Field Fix

## Problem
The OSH incident category field was always showing as null because it was defined as an ENUM with only specific allowed values. This prevented users from entering custom or random values for the accident category field.

## Solution
Changed the `accident_category`, `injury_severity`, and `damage_severity` fields from ENUM types to VARCHAR(255) to allow any text input.

## Files Modified

### 1. `src/models/oshIncident.model.js`
Changed:
- `accidentCategory`: `DataTypes.ENUM('People', 'Property/Asset')` → `DataTypes.STRING(255)`
- `injurySeverity`: `DataTypes.ENUM(...)` → `DataTypes.STRING(255)`
- `damageSeverity`: `DataTypes.ENUM(...)` → `DataTypes.STRING(255)`

###  surgies/03_create_osh_table_mysql.sql`
Changed:
- `accident_category`: `ENUM('People', 'Property/Asset')` → `VARCHAR(255)`
- `injury_severity`: `ENUM(...)` → `VARCHAR(255)`
- `damage_severity`: `ENUM(...)` → `VARCHAR(255)`

### 3. `src/scripts/simple-reset.js`
Updated the OSH table creation statement to use VARCHAR instead of ENUM for the same fields.

## Impact
- Users can now enter any text for accident category, injury severity, and damage severity fields
- No more NULL values due to constraint violations
- The frontend can accept random or custom values for these fields

## Database Update Required
If you have an existing database with the OSH table, you'll need to either:
1. Run the database reset script: `npm run db:reset`
2. Or manually alter the table columns if you want to preserve existing data

## Testing
Try creating or updating an OSH incident with custom category values - it should now save successfully instead of showing NULL.

