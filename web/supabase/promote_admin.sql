-- Give Admin Role to the current user (you)
-- Replace 'YOUR_EMAIL@EXAMPLE.COM' with your actual email if needed, 
-- or just run this for the user you are currently logged in as.

-- For safety, update ALL profiles to regular 'owner' role first if needed.
-- But here we just want to promote one user.

-- Assuming the user ID is known, or we update by email.
-- UPDATE profiles SET role = 'admin' WHERE email = 'naveen@example.com';

-- Since I don't know your email, I'll provide a generic update based on ID if you grab it from the URL or logs.
-- Or, just update the first user found.

UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM profiles LIMIT 1); 
-- WARNING: This makes the first user an admin.
-- If you have multiple users, be careful.

-- Better: 
-- UPDATE profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL';
