# Profile Image Upload Setup

## 1. Supabase Storage Bucket
- Go to your Supabase dashboard > Storage > Create bucket
- Name: `profile-images`
- Public: Yes (for demo/testing; for production, consider signed URLs)

## 2. Database Migration
Add a column to your users table:

```sql
alter table public.users add column profile_image_url text;
```

## 3. Usage
- When a user uploads an image, store it at `profile-images/{userId}.{ext}`
- Save the path (e.g., `profile-images/uuid.jpg`) in `profile_image_url` field
- To display: `https://<project-ref>.supabase.co/storage/v1/object/public/profile-images/{userId}.{ext}`

---
Proceed to update the code to use this setup.
