-- Sync avatar to image where image is NULL
UPDATE users 
SET image = avatar 
WHERE image IS NULL AND avatar IS NOT NULL;
