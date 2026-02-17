# Driver Verification System - Setup Guide

## Quick Setup (3 Steps)

### Step 1: Run SQL Script in Supabase

1. Open your Supabase project dashboard
2. Go to **SQL Editor** → **New Query**
3. Open the file: `supabase-verification-tables.sql`
4. Copy all content and paste into the SQL Editor
5. Click **Run**

✅ This creates:
- `driver_documents` table
- Verification columns in `users` table
- RLS policies
- Triggers and functions

---

### Step 2: Create Storage Bucket

**Option A - Using Dashboard (Recommended):**

1. Go to **Storage** in Supabase dashboard
2. Click **"New Bucket"**
3. Configure:
   - **Name:** `driver-documents`
   - **Public:** ❌ (Private/Not public)
   - **File size limit:** `10485760` (10MB)
   - **Allowed MIME types:** 
     - `image/jpeg`
     - `image/png`
     - `image/jpg`
     - `application/pdf`
4. Click **Create**

**Then add policies:**

1. Click on the `driver-documents` bucket
2. Go to **Policies** tab
3. Click **"New Policy"** → **"Create a policy from scratch"**

Create these 4 policies:

| # | Policy Name | Operation | Policy Definition (SQL) |
|---|-------------|-----------|------------------------|
| 1 | Users can upload to their own folder | INSERT | `(bucket_id = 'driver-documents' AND (storage.foldername(name))[1] = auth.uid()::text)` |
| 2 | Users can view their own documents | SELECT | `(bucket_id = 'driver-documents' AND (storage.foldername(name))[1] = auth.uid()::text)` |
| 3 | Users can update their own documents | UPDATE | `(bucket_id = 'driver-documents' AND (storage.foldername(name))[1] = auth.uid()::text)` |
| 4 | Users can delete their own documents | DELETE | `(bucket_id = 'driver-documents' AND (storage.foldername(name))[1] = auth.uid()::text)` |

For each policy:
- **Policy name:** Copy from table above
- **Allowed operation:** Select from dropdown
- **Target roles:** Select `authenticated`
- **Policy definition:** Paste the SQL from the table
- Click **Review** then **Save policy**

---

**Option B - Using API Script:**

1. Open `create-storage-bucket.js`
2. Replace `YOUR-PROJECT-ID` with your Supabase project ID
3. Replace `YOUR-ANON-KEY` with your Supabase anon key
4. Run: `node create-storage-bucket.js`

---

### Step 3: Test the Verification Page

1. Start your Next.js app: `pnpm dev`
2. Login as a driver user
3. Click **Verification** in the header
4. Upload documents for each step

---

## Features

### For Drivers:
- ✅ 4-step verification process
- ✅ Upload identity documents (front & back)
- ✅ Upload vehicle registration
- ✅ Upload insurance policy
- ✅ Real-time status tracking
- ✅ Save drafts
- ✅ View rejection reasons
- ✅ Progress indicator

### For Admins:
- ✅ View all driver documents
- ✅ Approve/reject documents
- ✅ Add rejection reasons
- ✅ Automatic user status updates

---

## Admin: How to Review Documents

### Method 1: Using SQL

In Supabase SQL Editor:

```sql
-- Approve a document
SELECT review_driver_document('DOCUMENT-UUID-HERE', 'approved');

-- Reject a document with reason
SELECT review_driver_document('DOCUMENT-UUID-HERE', 'rejected', 'Document is too blurry');
```

### Method 2: Using Table Editor

1. Go to **Table Editor** → `driver_documents`
2. Find the document
3. Edit the row:
   - Set `status` to `approved` or `rejected`
   - Add `rejection_reason` if rejected
   - Set `reviewed_by` to your user UUID
   - Set `reviewed_at` to current timestamp

---

## Database Schema

### driver_documents table:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `driver_id` | UUID | Reference to users.id |
| `document_type` | TEXT | `identity_front`, `identity_back`, `vehicle_registration`, `insurance` |
| `document_url` | TEXT | URL to document in storage |
| `status` | TEXT | `pending`, `approved`, `rejected` |
| `rejection_reason` | TEXT | Reason if rejected |
| `metadata` | JSONB | Extra data (license number, vehicle type, etc.) |
| `reviewed_by` | UUID | Admin who reviewed |
| `reviewed_at` | TIMESTAMP | When reviewed |
| `created_at` | TIMESTAMP | Upload timestamp |
| `updated_at` | TIMESTAMP | Last update |

### users table (new columns):

| Column | Type | Description |
|--------|------|-------------|
| `verification_status` | TEXT | `not_submitted`, `pending_approval`, `verified`, `rejected` |
| `is_available` | BOOLEAN | Driver availability status |

---

## Troubleshooting

### "Bucket not found" error:
- Make sure you created the `driver-documents` bucket
- Check bucket name is exactly `driver-documents` (case-sensitive)

### "Permission denied" error:
- Ensure RLS policies are set up correctly
- Check user is authenticated
- Verify storage policies allow the operation

### Documents not uploading:
- Check file size is under 10MB
- Verify file type is allowed (jpg, png, pdf)
- Check browser console for errors

### Status not updating:
- Verify triggers are created
- Check `update_verification_status_trigger` exists
- Ensure all 4 document types are submitted

---

## File Structure

```
project/
├── app/
│   └── driver/
│       └── verification/
│           └── page.tsx          # Verification page component
├── components/
│   └── driver-header.tsx          # Header with Verification link
├── supabase-verification-tables.sql    # SQL for tables & policies
├── create-storage-bucket.js       # Script to create bucket
└── VERIFICATION-SETUP.md          # This file
```

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase logs in dashboard
3. Ensure all SQL scripts ran successfully
4. Check RLS policies are active
