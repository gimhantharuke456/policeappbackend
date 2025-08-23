const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const r2Config = require('./config/r2Config');

// R2 Configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: r2Config.s3Config.endpoint,
  credentials: r2Config.s3Config.credentials
});

const BUCKET_NAME = r2Config.bucketName;
const SOURCE_DIR = path.join(__dirname, 'voicerecords');
const DESTINATION_PREFIX = r2Config.baseFolderPath;

// Function to get MIME type
function getMimeType(filePath) {
  return mime.lookup(filePath) || 'application/octet-stream';
}

// Function to upload a single file
async function uploadFile(filePath, bucketKey) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const mimeType = getMimeType(filePath);
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: bucketKey,
      Body: fileContent,
      ContentType: mimeType
    });
    
    await r2Client.send(command);
    console.log(`✅ Uploaded: ${bucketKey}`);
    return true;
  } catch (error) {
    console.error(`❌ Error uploading ${bucketKey}:`, error);
    return false;
  }
}

// Function to recursively upload directory
async function uploadDirectory(dirPath, prefix = '') {
  const files = fs.readdirSync(dirPath);
  let uploadedCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    // Create relative path for S3 key
    const relativePath = path.relative(SOURCE_DIR, filePath);
    const bucketKey = prefix ? `${prefix}/${relativePath}` : relativePath;
    
    if (stats.isDirectory()) {
      // Recursively upload subdirectories
      const result = await uploadDirectory(filePath, prefix);
      uploadedCount += result.uploadedCount;
      errorCount += result.errorCount;
    } else {
      // Upload file
      const success = await uploadFile(filePath, bucketKey);
      if (success) {
        uploadedCount++;
      } else {
        errorCount++;
      }
    }
  }
  
  return { uploadedCount, errorCount };
}

// Function to check if a file exists in the bucket
async function checkFileExists(bucketKey) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: bucketKey,
      MaxKeys: 1
    });
    
    const response = await r2Client.send(command);
    return response.Contents && response.Contents.length > 0;
  } catch (error) {
    console.error(`Error checking if file exists: ${bucketKey}`, error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting upload to R2 bucket...');
  console.log(`Source directory: ${SOURCE_DIR}`);
  console.log(`Destination bucket: ${BUCKET_NAME}`);
  console.log(`Destination prefix: ${DESTINATION_PREFIX}`);
  console.log('-------------------------------------------');
  
  try {
    // Check if bucket is accessible
    try {
      await r2Client.send(new ListObjectsV2Command({ Bucket: BUCKET_NAME, MaxKeys: 1 }));
      console.log(`✅ Connected to bucket: ${BUCKET_NAME}`);
    } catch (error) {
      console.error(`❌ Failed to connect to bucket: ${BUCKET_NAME}`);
      console.error('Error details:', error);
      return;
    }
    
    // Start upload
    const result = await uploadDirectory(SOURCE_DIR, DESTINATION_PREFIX);
    
    console.log('\nUpload Summary:');
    console.log(`✅ Successfully uploaded: ${result.uploadedCount} files`);
    console.log(`❌ Failed uploads: ${result.errorCount} files`);
    
    if (result.uploadedCount > 0) {
      console.log(`\nFiles are now accessible at: ${r2Config.publicUrl}/${DESTINATION_PREFIX}/`);
    }
    
    console.log('\nUpload process completed!');
  } catch (error) {
    console.error('Error during upload process:', error);
  }
}

// Run the script
main();