# Member Deletion Fix

## Problem
When trying to delete a member through the frontend, a 500 Internal Server Error occurred due to foreign key constraint violations. The member was referenced in other tables (like `login_accounts` and `union_executives`), and these references needed to be handled properly during deletion.

## Solution
Updated the `members.controller.js` to manually delete related records before destroying the member record.

### Changes Made

1. **Updated `src/controllers/members.controller.js`**:
   - Modified the `remove` function to delete related records first:
     - Delete login account if exists
     - Delete union executives if member is an executive
     - Then delete the member

2. **Updated `src/scripts/simple-reset.js`**:
   - Added `ON DELETE CASCADE` to foreign key constraints for `login_accounts` and `union_executives`
   - This ensures that when a member is deleted from future database resets, related records are automatically cleaned up

## How It Works Now

When you delete a member with `?confirm=true`:
1. The system first deletes any associated `login_accounts` record
2. The system deletes any `union_executives` records where this member was an executive
3. Finally, the system deletes the member record itself

## Testing

Test member deletion from the frontend - it should now work without errors.

## API Endpoint

```
DELETE /api/members/:id?confirm=true
```

## Note

For future database resets, the `ON DELETE CASCADE` constraints will handle this automatically, but the manual cleanup in the controller is still recommended for better control and error handling.

