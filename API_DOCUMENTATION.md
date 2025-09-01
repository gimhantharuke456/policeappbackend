# Police App Backend API Documentation

## Base URL
- Development: `http://localhost:3002`
- Production: `https://your-production-domain.com`

## Authentication
Most endpoints require JWT token authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## User Management APIs

### 1. User Registration
**Endpoint:** `POST /registration`

**Description:** Register a new police officer

**Request Body:**
```json
{
  "fullName": "Officer John Doe",
  "officerSVC": "SVC12345",
  "officerRank": "Inspector",
  "policeStation": "Colombo Central",
  "Password": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "status": true,
  "success": "User registered successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "fullName": "Officer John Doe",
    "officerSVC": "SVC12345",
    "officerRank": "Inspector",
    "policeStation": "Colombo Central",
    "createdAt": "2023-09-06T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "status": false,
  "error": "Officer SVC already exists"
}
```

---

### 2. User Login
**Endpoint:** `POST /login`

**Description:** Authenticate a police officer

**Request Body:**
```json
{
  "officerSVC": "SVC12345",
  "Password": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "status": true,
  "success": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "officerSVC": "SVC12345",
    "fullName": "Officer John Doe",
    "policeStation": "Colombo Central"
  }
}
```

**Error Response (401):**
```json
{
  "status": false,
  "error": "Invalid email or password"
}
```

---

### 3. Verify Token
**Endpoint:** `POST /verify`

**Description:** Verify JWT token validity

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "status": true,
  "message": "Token is valid",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "officerSVC": "SVC12345"
  }
}
```

---

### 4. Update Profile
**Endpoint:** `POST /profile`

**Description:** Update officer profile information

**Request Body:**
```json
{
  "officerId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "fullName": "Officer John Smith",
  "email": "john.smith@police.gov.lk",
  "phone": "+94771234567"
}
```

**Success Response (200):**
```json
{
  "status": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "fullName": "Officer John Smith",
    "email": "john.smith@police.gov.lk",
    "phone": "+94771234567",
    "updatedAt": "2023-09-06T11:30:00.000Z"
  }
}
```

---

### 5. Get Profile Details
**Endpoint:** `GET /profile/:id`

**Description:** Get officer profile by ID

**Success Response (200):**
```json
{
  "status": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "fullName": "Officer John Doe",
    "officerSVC": "SVC12345",
    "officerRank": "Inspector",
    "policeStation": "Colombo Central",
    "email": "john.doe@police.gov.lk",
    "phone": "+94771234567",
    "createdAt": "2023-09-06T10:30:00.000Z"
  }
}
```

---

## Violation Management APIs

### 1. Create New Violation
**Endpoint:** `POST /violations/violation`

**Description:** Create a new traffic violation record

**Request Body:**
```json
{
  "formData": {
    "tourist": {
      "name": "John Smith",
      "passport": "US123456789",
      "country": "United States",
      "id": "ID123456"
    },
    "violation": {
      "type": "Speed Limit Violation",
      "date": "2023-09-06",
      "time": "14:30",
      "location": "Galle Road, Colombo 03",
      "fine": "5000"
    },
    "officer": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Officer John Doe"
    },
    "timestamp": "2023-09-06T14:30:00.000Z"
  }
}
```

**Success Response (201):**
```json
{
  "status": true,
  "success": "Violation record created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "tourist": {
      "name": "John Smith",
      "passport": "US123456789",
      "country": "United States",
      "id": "ID123456"
    },
    "violation": {
      "type": "Speed Limit Violation",
      "date": "2023-09-06",
      "time": "14:30",
      "location": "Galle Road, Colombo 03",
      "fine": "5000"
    },
    "officer": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Officer John Doe"
    },
    "referenceNumber": "VIO-2023-001234",
    "createdAt": "2023-09-06T14:30:00.000Z",
    "timestamp": "2023-09-06T14:30:00.000Z"
  }
}
```

---

### 2. Get Violations (Search/Filter)
**Endpoint:** `POST /violations/getviolation`

**Description:** Search and filter violation records

**Request Body (All fields optional for filtering):**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
  "tourist.name": "John Smith",
  "tourist.passport": "US123456789",
  "tourist.country": "United States",
  "violation.type": "Speed Limit Violation",
  "violation.date": "2023-09-06",
  "officer.id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "status": "active"
}
```

**Success Response (200):**
```json
{
  "status": true,
  "violations": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "tourist": {
        "name": "John Smith",
        "passport": "US123456789",
        "country": "United States",
        "id": "ID123456"
      },
      "violation": {
        "type": "Speed Limit Violation",
        "date": "2023-09-06",
        "time": "14:30",
        "location": "Galle Road, Colombo 03",
        "fine": "5000"
      },
      "officer": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Officer John Doe"
      },
      "referenceNumber": "VIO-2023-001234",
      "createdAt": "2023-09-06T14:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

### 3. Get Violation by ID
**Endpoint:** `GET /violations/violation/:id`

**Description:** Get a specific violation by its ID

**Success Response (200):**
```json
{
  "status": true,
  "violation": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "tourist": {
      "name": "John Smith",
      "passport": "US123456789",
      "country": "United States",
      "id": "ID123456"
    },
    "violation": {
      "type": "Speed Limit Violation",
      "date": "2023-09-06",
      "time": "14:30",
      "location": "Galle Road, Colombo 03",
      "fine": "5000"
    },
    "officer": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Officer John Doe"
    },
    "referenceNumber": "VIO-2023-001234",
    "createdAt": "2023-09-06T14:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "status": false,
  "error": "Violation not found"
}
```

---

### 4. Get Violations by Officer
**Endpoint:** `POST /violations/officer`

**Description:** Get all violations created by a specific officer

**Request Body:**
```json
{
  "officerId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

**Success Response (200):**
```json
{
  "status": true,
  "violations": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "tourist": {
        "name": "John Smith",
        "passport": "US123456789",
        "country": "United States"
      },
      "violation": {
        "type": "Speed Limit Violation",
        "date": "2023-09-06",
        "fine": "5000"
      },
      "referenceNumber": "VIO-2023-001234"
    }
  ],
  "total": 1
}
```

---

## Voice Records APIs

### 1. Get Voice Records by Rule Name
**Endpoint:** `GET /api/voicerecords/:ruleName`

**Description:** Get audio files for a specific traffic rule (supports both Sinhala rule names and numeric folder IDs)

**Example URLs:**
- `/api/voicerecords/10` (numeric folder)
- `/api/voicerecords/වේග සීමාවන් ඉක්මවා යාම` (Sinhala rule name)

**Success Response (200):**
```json
{
  "success": true,
  "ruleName": "10",
  "mainFile": {
    "filename": "10.mp3",
    "url": "https://r2-bucket-url.com/voicerecords/10/10.mp3",
    "localUrl": "http://localhost:3002/voicerecords/10/10.mp3",
    "type": "mp3",
    "fromR2": true
  },
  "allFiles": [
    {
      "filename": "10.mp3",
      "url": "https://r2-bucket-url.com/voicerecords/10/10.mp3",
      "localUrl": "http://localhost:3002/voicerecords/10/10.mp3",
      "size": 1024000,
      "type": "mp3",
      "isMainFile": true,
      "fromR2": true
    },
    {
      "filename": "additional_audio.wav",
      "url": "https://r2-bucket-url.com/voicerecords/10/additional_audio.wav",
      "localUrl": "http://localhost:3002/voicerecords/10/additional_audio.wav",
      "size": 2048000,
      "type": "wav",
      "isMainFile": false,
      "fromR2": true
    }
  ]
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "No folder found for rule: 10"
}
```

---

### 2. List All Voice Records Folders
**Endpoint:** `GET /api/voicerecords`

**Description:** Get a list of all available voice records folders

**Success Response (200):**
```json
{
  "success": true,
  "folders": [
    {
      "name": "1",
      "audioFileCount": 2,
      "hasMainFile": true,
      "mainFileUrl": "https://r2-bucket-url.com/voicerecords/1/1.mp3",
      "r2FolderUrl": "https://r2-bucket-url.com/voicerecords/1/",
      "localFolderUrl": "http://localhost:3002/voicerecords/1/"
    },
    {
      "name": "2",
      "audioFileCount": 1,
      "hasMainFile": true,
      "mainFileUrl": "https://r2-bucket-url.com/voicerecords/2/2.mp3",
      "r2FolderUrl": "https://r2-bucket-url.com/voicerecords/2/",
      "localFolderUrl": "http://localhost:3002/voicerecords/2/"
    }
  ],
  "totalFolders": 36,
  "baseR2Url": "https://r2-bucket-url.com/voicerecords/",
  "baseLocalUrl": "http://localhost:3002/voicerecords/"
}
```

---

## Track Management APIs

### 1. Get All Tracks
**Endpoint:** `GET /api/tracks`

**Description:** Get a list of all available track folders

**Success Response (200):**
```json
{
  "success": true,
  "folders": ["rule1", "rule2", "rule3"]
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Failed to fetch track folders",
  "error": "ENOENT: no such file or directory"
}
```

---

### 2. Get Track Files by Rule Number
**Endpoint:** `GET /api/tracks/:ruleNumber`

**Description:** Get audio files for a specific track rule

**Success Response (200):**
```json
{
  "success": true,
  "ruleNumber": "rule1",
  "audioFiles": [
    {
      "filename": "rule1.mp3",
      "url": "http://localhost:3002/tracks/rule1/rule1.mp3",
      "size": 1024000,
      "isMainFile": true
    },
    {
      "filename": "additional.wav",
      "url": "http://localhost:3002/tracks/rule1/additional.wav",
      "size": 2048000,
      "isMainFile": false
    }
  ]
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "No folder found for rule rule1"
}
```

---

## Admin APIs

### 1. Add Single SVC
**Endpoint:** `POST /api/admin/add-svc`

**Description:** Add a single officer SVC to the registration system

**Request Body:**
```json
{
  "officerSVC": "SVC12345",
  "officerRank": "Inspector",
  "policeStation": "Colombo Central"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "SVC added successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "officerSVC": "SVC12345",
    "officerRank": "Inspector",
    "policeStation": "Colombo Central",
    "isActive": true,
    "createdAt": "2023-09-06T15:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "SVC already exists"
}
```

---

### 2. Bulk Add SVCs
**Endpoint:** `POST /api/admin/bulk-add-svc`

**Description:** Add multiple officer SVCs in bulk

**Request Body:**
```json
{
  "svcs": [
    {
      "officerSVC": "SVC12345",
      "officerRank": "Inspector",
      "policeStation": "Colombo Central"
    },
    {
      "officerSVC": "SVC12346",
      "officerRank": "Sergeant",
      "policeStation": "Kandy Central"
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Bulk SVC addition completed",
  "results": {
    "successful": 2,
    "failed": 0,
    "total": 2
  },
  "details": [
    {
      "officerSVC": "SVC12345",
      "status": "success",
      "data": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "officerSVC": "SVC12345",
        "isActive": true
      }
    },
    {
      "officerSVC": "SVC12346",
      "status": "success",
      "data": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "officerSVC": "SVC12346",
        "isActive": true
      }
    }
  ]
}
```

---

### 3. List All SVCs
**Endpoint:** `GET /api/admin/list-svc`

**Description:** Get a list of all registered SVCs

**Success Response (200):**
```json
{
  "success": true,
  "svcs": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "officerSVC": "SVC12345",
      "officerRank": "Inspector",
      "policeStation": "Colombo Central",
      "isActive": true,
      "createdAt": "2023-09-06T15:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

## Rule Management APIs

### 1. Get All Tracks (Alternative)
**Endpoint:** `POST /alltracks`

**Description:** Alternative endpoint to get all track folders

**Success Response (200):**
```json
{
  "success": true,
  "folders": ["rule1", "rule2", "rule3"]
}
```

---

## Data Models

### Officer Model
```json
{
  "_id": "ObjectId",
  "fullName": "String (required)",
  "officerSVC": "String (required, unique)",
  "officerRank": "String (required)",
  "policeStation": "String (required)",
  "Password": "String (required, hashed)",
  "email": "String (optional, unique)",
  "phone": "String (optional)",
  "profilePicture": "String (optional)",
  "createdAt": "Date (default: now)",
  "updatedAt": "Date (default: now)"
}
```

### Violation Model
```json
{
  "_id": "ObjectId",
  "tourist": {
    "name": "String (required)",
    "passport": "String (required)",
    "country": "String (required)",
    "id": "String (required)"
  },
  "violation": {
    "type": "String (required)",
    "date": "String (required)",
    "time": "String (required)",
    "location": "String (required)",
    "fine": "String (required)"
  },
  "officer": {
    "id": "String (required, ref: 'officer')",
    "name": "String (required)"
  },
  "referenceNumber": "String (required, unique)",
  "createdAt": "Date (default: now)",
  "updatedAt": "Date (default: now)",
  "timestamp": "String (required)"
}
```

### RegSVC Model
```json
{
  "_id": "ObjectId",
  "officerSVC": "String (required, unique)",
  "officerRank": "String (optional)",
  "policeStation": "String (optional)",
  "isActive": "Boolean (default: true)",
  "createdAt": "Date (default: now)",
  "updatedAt": "Date (default: now)"
}
```

---

## Error Handling

All endpoints follow a consistent error response format:

### Standard Error Response
```json
{
  "status": false,
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes
- `200` - Success (GET requests)
- `201` - Created (POST requests)
- `400` - Bad Request (Invalid input data)
- `401` - Unauthorized (Invalid credentials or token)
- `404` - Not Found (Resource doesn't exist)
- `500` - Internal Server Error (Server-side error)

---

## Notes

1. **File Storage**: The application supports both local file storage and Cloudflare R2 cloud storage for audio files.

2. **Authentication**: JWT tokens are used for authentication with a 48-hour expiration time.

3. **Password Security**: Passwords are hashed using bcrypt before storage.

4. **Folder Mapping**: Voice records support both Sinhala rule names and numeric folder IDs through a mapping system.

5. **CORS**: The API supports CORS for frontend integration with configurable origins.

6. **File Uploads**: The system supports file uploads with multer middleware for profile pictures and other assets.

7. **Reference Numbers**: Violation records automatically generate unique reference numbers.

8. **Timestamps**: All models include automatic timestamp management for creation and updates.