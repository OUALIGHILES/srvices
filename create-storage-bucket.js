// ============================================
// CREATE STORAGE BUCKET SCRIPT
// Run this with Node.js to create the storage bucket
// ============================================

const SUPABASE_URL = 'https://YOUR-PROJECT-ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';

async function createBucket() {
  try {
    // Step 1: Create the bucket
    console.log('Creating bucket...');
    const bucketResponse = await fetch(`${SUPABASE_URL}/storage/v1/buckets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Preferred-Code-Name': '2024-01-01'
      },
      body: JSON.stringify({
        id: 'driver-documents',
        name: 'driver-documents',
        public: false,
        file_size_limit: 10485760, // 10MB
        allowed_mime_types: [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'application/pdf'
        ]
      })
    });

    const bucketData = await bucketResponse.json();
    
    if (bucketResponse.ok || bucketData.error?.includes('already exists')) {
      console.log('✓ Bucket created or already exists');
    } else {
      console.error('Error creating bucket:', bucketData);
      return;
    }

    // Step 2: Create storage policies
    console.log('Creating storage policies...');
    
    const policies = [
      {
        name: 'Users can upload to their own folder',
        action: 'INSERT',
        target: 'authenticated',
        definition: `(bucket_id = 'driver-documents' AND (storage.foldername(name))[1] = auth.uid()::text)`
      },
      {
        name: 'Users can view their own documents',
        action: 'SELECT',
        target: 'authenticated',
        definition: `(bucket_id = 'driver-documents' AND (storage.foldername(name))[1] = auth.uid()::text)`
      },
      {
        name: 'Users can update their own documents',
        action: 'UPDATE',
        target: 'authenticated',
        definition: `(bucket_id = 'driver-documents' AND (storage.foldername(name))[1] = auth.uid()::text)`
      },
      {
        name: 'Users can delete their own documents',
        action: 'DELETE',
        target: 'authenticated',
        definition: `(bucket_id = 'driver-documents' AND (storage.foldername(name))[1] = auth.uid()::text)`
      }
    ];

    for (const policy of policies) {
      const policyResponse = await fetch(`${SUPABASE_URL}/rest/v1/policies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          schema: 'storage',
          table_name: 'objects',
          policy_name: policy.name,
          action: policy.action,
          target: policy.target,
          definition: policy.definition,
          check: policy.definition
        })
      });

      if (policyResponse.ok) {
        console.log(`✓ Policy created: ${policy.name}`);
      } else {
        const errorData = await policyResponse.json();
        console.log(`Policy "${policy.name}" - ${JSON.stringify(errorData)}`);
      }
    }

    console.log('\n=================================');
    console.log('✓ Storage bucket setup complete!');
    console.log('=================================');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

createBucket();
