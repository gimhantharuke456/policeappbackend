# R2 Storage Migration Guide

## Overview

This document provides instructions for migrating the `voicerecords` folder from local storage to Cloudflare R2 storage. The backend application has been updated to serve audio files from R2 while maintaining backward compatibility with local files.

## Configuration

The R2 configuration is stored in `config/r2Config.js` with the following parameters:

- `publicUrl`: The public URL for accessing files (`https://pub-7f23c6b5b0224e4182230baa27483566.r2.dev`)
- `bucketName`: The R2 bucket name (`policeapp`)
- `baseFolderPath`: The base folder path in the bucket (`voicerecords`)
- `s3Config`: Configuration for the S3 client
  - `endpoint`: The R2 endpoint URL
  - `region`: The region (set to 'auto')
  - `credentials`: Access key ID and secret access key
- `token`: Authentication token

## Manual Upload Instructions

Since the automated upload script is encountering authentication issues, follow these steps to manually upload the files to R2:

1. Log in to the Cloudflare dashboard
2. Navigate to R2 > Buckets > policeapp
3. Create a folder named `voicerecords` if it doesn't exist
4. Upload the contents of the local `voicerecords` folder to the R2 bucket, maintaining the same folder structure

## API Changes

The backend API has been updated to use R2 URLs for serving audio files:

### GET /api/voicerecords/:ruleName

- Returns audio files for a specific rule folder
- Now includes both R2 URLs (`url`) and local URLs (`localUrl`) for each file
- The main URL now points to the R2 storage

### GET /api/voicerecords

- Lists all available voicerecords folders
- Now includes R2 URLs for folders and main files
- Includes base URLs for both R2 and local storage

## Testing

After uploading files to R2, test the API endpoints to ensure they return the correct URLs:

```
GET /api/voicerecords
GET /api/voicerecords/1. හඳුනාගැනීමේ තහඩු
```

Verify that the returned URLs point to the R2 storage and that the audio files are accessible.

## Troubleshooting

If you encounter issues with R2 access:

1. Verify the R2 credentials in `config/r2Config.js`
2. Check that the bucket permissions allow public access to the files
3. Ensure the files have been uploaded to the correct location in the R2 bucket
4. Test direct access to files using the public URL

## Fallback Mechanism

The application will continue to serve files from the local `voicerecords` folder if they are not available in R2. This provides a fallback mechanism during the migration process.