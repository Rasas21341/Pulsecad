# Notification System Setup Instructions

## Step 1: Update Your Database

### Option A: Using Supabase Dashboard
1. Go to [Supabase](https://supabase.com) and open your project
2. Click **SQL Editor** in the left sidebar
3. Click **+ New Query**
4. Copy the entire contents of `notifications_table.sql`
5. Paste it into the SQL editor
6. Click **Run** (▶️ button)
7. You should see a success message

### Option B: Using Terminal/CLI
```bash
# If using Supabase CLI
supabase db push
```

## Step 2: Verify Table Creation

1. In Supabase dashboard, go to **Table Editor**
2. Look for the new `notifications` table in the list
3. Click on it to verify the columns:
   - `id` (UUID)
   - `type` (text)
   - `title` (text)
   - `message` (text)
   - `created_by` (uuid)
   - `created_at` (timestamp)
   - `is_read` (boolean)

## Step 3: Test the Notification System

### Testing as a Regular User:
1. Open your application and log in
2. You should see a 🔔 bell icon in the top-right header
3. Click the bell icon
4. You should see the notifications dropdown (currently empty)

### Testing as Staff:
1. Log in with a staff account
2. Click "Staff Dashboard" button
3. In the sidebar, click "Send Notifications"
4. Fill out the form:
   - **Type**: Choose "Announcement"
   - **Title**: "Test Notification"
   - **Message**: "This is a test message"
5. Click "Send Notification to All Users"
6. You should see a ✓ success message
7. Click on another user's account (or open in another browser)
8. The new notification should appear in the bell dropdown

## Step 4: Customize (Optional)

### Change Bell Icon
In `index.html`, find the bell icon:
```html
<button class="notification-bell" id="notificationBell" ...>
    🔔  <!-- Change this emoji -->
```

### Change Colors
- Bell badge color: Search for `#ef4444` (red) and change to desired color
- Dropdown background: Search for `#14171f` 
- Notification type badge: Search for `#3b82f6` (blue)

### Change Notification Types
In the staff notifications form, modify the dropdown options:
```html
<select id="notificationType" ...>
    <option value="changelog">Changelog</option>
    <option value="announcement">Announcement</option>
    <!-- Add/remove options as needed -->
</select>
```

## Common Issues & Solutions

### ❌ "Table notifications does not exist"
**Solution**: Run the SQL from `notifications_table.sql` again. Make sure it completes without errors.

### ❌ Bell icon not showing after login
**Solution**: 
- Check browser console (F12 → Console tab)
- Look for JavaScript errors
- Ensure `currentUser` variable is being set correctly

### ❌ Can't send notifications
**Solution**:
- Make sure you're logged in as staff
- Check that the `notifications` table exists (see Step 2)
- Verify RLS policies were created by running:
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'notifications';
  ```

### ❌ Dropdown closes immediately
**Solution**:
- Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
- Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
- Check for JavaScript errors in console

## Security Notes

### Current Configuration:
- Any authenticated user can **read** notifications
- Any authenticated user can **create** notifications

### If you want to restrict creation to staff only:
Replace the notification creation policy with:
```sql
-- Replace this in the database:
DROP POLICY "Allow staff to create notifications" ON notifications;

CREATE POLICY "Allow only staff to create notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT is_staff FROM users WHERE auth.uid() = users.user_id)
);
```

*(Note: This requires an `is_staff` field in your `users` table)*

## Database Backup

Before making changes, it's good practice to backup your database:

1. In Supabase dashboard
2. Go to **Settings** → **Backups**
3. Click **Create a manual backup**
4. This creates a snapshot you can restore from if needed

## Next Steps

Once the notification system is working:

1. **Test thoroughly** with different user accounts
2. **Customize notification types** to match your needs
3. **Consider adding email notifications** for important alerts
4. **Add admin controls** to delete old notifications
5. **Implement read status tracking** to show unread badges

## Support

If you encounter issues:
1. Check the browser console for errors (F12)
2. Verify the `notifications` table exists
3. Test with a fresh browser session (incognito/private mode)
4. Check Supabase logs for database errors

---

**Notification System Created:** March 2, 2026
**Version:** 1.0
