# API Endpoints Documentation

Complete reference for all REST API endpoints in the Dev Academy platform.

## Authentication

All endpoints except `/api/courses` require authentication via Auth.js session. Include authentication headers in
requests.

**Session Requirement:**

```typescript
const session = await auth();
if (!session?.user?.email) {
  return 401 Unauthorized
}
```

## User Management Endpoints

### GET /api/user/profile

Fetch authenticated user's profile information.

**Authentication:** Required **Response:** 200 OK

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "bio": "Software developer and educator",
  "avatar": "https://example.com/avatar.jpg",
  "locale": "en",
  "timezone": "UTC",
  "createdAt": "2025-01-03T00:00:00Z",
  "updatedAt": "2025-01-03T12:00:00Z"
}
```

**Error Responses:**

- `401 Unauthorized` - No valid session
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### PATCH /api/user/profile

Update user's profile information.

**Authentication:** Required **Request Body:**

```json
{
  "name": "Jane Doe", // optional, string
  "bio": "Updated bio", // optional, max 500 chars
  "avatar": "https://..." // optional, valid URL
}
```

**Response:** 200 OK

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "Jane Doe",
  "bio": "Updated bio",
  "avatar": "https://...",
  "locale": "en",
  "timezone": "UTC",
  "createdAt": "2025-01-03T00:00:00Z",
  "updatedAt": "2025-01-03T12:30:00Z"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid input (Zod validation error)
- `401 Unauthorized` - No valid session
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### PATCH /api/user/language

Update user's language preference and locale.

**Authentication:** Required **Request Body:**

```json
{
  "locale": "es" // Required, one of: en, es, pt, hi, zh, de, hu
}
```

**Response:** 200 OK

```json
{
  "success": true,
  "locale": "es",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "locale": "es",
    "updatedAt": "2025-01-03T12:45:00Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Invalid locale
  ```json
  {
    "error": "Invalid locale",
    "validLocales": ["en", "es", "pt", "hi", "zh", "de", "hu"]
  }
  ```
- `401 Unauthorized` - No valid session
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

## Courses Endpoints

### GET /api/courses

List all published courses with translations in user's locale.

**Authentication:** Optional (shows enrollment status if authenticated) **Query Parameters:** None **Response:** 200 OK

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "slug": "react-fundamentals",
    "title": "React Fundamentals",
    "description": "Learn the basics of React...",
    "thumbnail": "https://example.com/thumb.jpg",
    "enrollmentCount": 42,
    "userEnrollment": {
      "id": "enrollment-uuid",
      "status": "active",
      "progress": 45,
      "enrolledAt": "2025-01-01T10:00:00Z"
    },
    "createdAt": "2024-12-01T00:00:00Z",
    "updatedAt": "2025-01-03T00:00:00Z"
  }
]
```

**Notes:**

- Uses user's locale from session or defaults to `en`
- `userEnrollment` is `null` if user not authenticated
- Only published courses are listed
- Results ordered by creation date (newest first)

---

### GET /api/courses/[id]

Fetch detailed course information including modules, lessons, and translations.

**Authentication:** Optional **Parameters:**

- `id` (path) - Course UUID

**Response:** 200 OK

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "slug": "react-fundamentals",
  "title": "React Fundamentals",
  "description": "Complete guide to React...",
  "content": "Long-form course content...",
  "thumbnail": "https://example.com/thumb.jpg",
  "seoTitle": "React Fundamentals Course",
  "seoDescription": "Learn React from basics to advanced",
  "instructors": [
    {
      "id": "instructor-uuid",
      "name": "John Developer",
      "email": "john@example.com",
      "avatar": "https://..."
    }
  ],
  "modules": [
    {
      "id": "module-uuid",
      "order": 1,
      "title": "Getting Started",
      "description": "Module introduction",
      "lessons": [
        {
          "id": "lesson-uuid",
          "order": 1,
          "title": "What is React?",
          "content": "Lesson content...",
          "videoUrl": "https://...",
          "duration": 15
        }
      ]
    }
  ],
  "enrollmentCount": 42,
  "userEnrollment": {
    "id": "enrollment-uuid",
    "status": "active",
    "progress": 45,
    "completedAt": null,
    "enrolledAt": "2025-01-01T10:00:00Z"
  },
  "createdAt": "2024-12-01T00:00:00Z",
  "updatedAt": "2025-01-03T00:00:00Z"
}
```

**Error Responses:**

- `404 Not Found` - Course not found
- `403 Forbidden` - Course not published
- `500 Internal Server Error` - Server error

---

## Progress Tracking Endpoints

### GET /api/progress/[courseId]

Get course progress for authenticated user.

**Authentication:** Required **Parameters:**

- `courseId` (path) - Course UUID

**Response:** 200 OK

```json
{
  "courseId": "550e8400-e29b-41d4-a716-446655440001",
  "enrollmentStatus": "active",
  "progress": {
    "modules": {
      "complete": 3,
      "total": 5,
      "percentage": 60
    },
    "lessons": {
      "complete": 12,
      "total": 20,
      "percentage": 60
    },
    "overallProgress": 60
  },
  "lastAccessedAt": "2025-01-03T14:00:00Z",
  "updatedAt": "2025-01-03T13:45:00Z"
}
```

**Error Responses:**

- `401 Unauthorized` - No valid session
- `403 Forbidden` - Not enrolled in course
- `404 Not Found` - Course not found
- `500 Internal Server Error` - Server error

---

### PATCH /api/progress/[courseId]/lesson

Mark a lesson as complete.

**Authentication:** Required **Parameters:**

- `courseId` (path) - Course UUID

**Request Body:**

```json
{
  "lessonId": "lesson-uuid" // Required, UUID
}
```

**Response:** 200 OK

```json
{
  "success": true,
  "progress": {
    "lessonId": "lesson-uuid",
    "lessonsComplete": 5,
    "modulesComplete": 1,
    "overallProgress": 50
  }
}
```

**Notes:**

- Automatically increments module completion when all lessons in module are complete
- Updates overall course progress percentage
- Updates `lastAccessedAt` timestamp

**Error Responses:**

- `400 Bad Request` - Invalid lesson ID
- `401 Unauthorized` - No valid session
- `403 Forbidden` - Not enrolled in course
- `404 Not Found` - Lesson not found or doesn't belong to course
- `500 Internal Server Error` - Server error

---

### PATCH /api/progress/[courseId]/module

Mark entire module as complete.

**Authentication:** Required **Parameters:**

- `courseId` (path) - Course UUID

**Request Body:**

```json
{
  "moduleId": "module-uuid" // Required, UUID
}
```

**Response:** 200 OK

```json
{
  "success": true,
  "progress": {
    "moduleId": "module-uuid",
    "lessonsInModule": 4,
    "modulesComplete": 2,
    "lessonsComplete": 8,
    "overallProgress": 40
  }
}
```

**Notes:**

- Marks all lessons in module as complete
- Increments module completion counter
- Updates overall course progress percentage
- Updates `lastAccessedAt` timestamp

**Error Responses:**

- `400 Bad Request` - Invalid module ID
- `401 Unauthorized` - No valid session
- `403 Forbidden` - Not enrolled in course
- `404 Not Found` - Module not found or doesn't belong to course
- `500 Internal Server Error` - Server error

---

## Enrollments Endpoints

### GET /api/enrollments

List all course enrollments for authenticated user.

**Authentication:** Required **Response:** 200 OK

```json
[
  {
    "id": "enrollment-uuid",
    "courseId": "550e8400-e29b-41d4-a716-446655440001",
    "courseSlug": "react-fundamentals",
    "courseTitle": "React Fundamentals",
    "courseThumbnail": "https://...",
    "status": "active",
    "progress": 45,
    "completedAt": null,
    "enrolledAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-03T12:00:00Z"
  }
]
```

**Notes:**

- Returns only enrollments for authenticated user
- Ordered by enrollment date (newest first)
- Includes course translations in user's locale

---

### POST /api/enrollments

Enroll user in a course.

**Authentication:** Required **Request Body:**

```json
{
  "courseId": "550e8400-e29b-41d4-a716-446655440001" // Required, UUID
}
```

**Response:** 201 Created

```json
{
  "id": "enrollment-uuid",
  "status": "active",
  "progress": 0,
  "enrolledAt": "2025-01-03T13:00:00Z",
  "courseId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid course ID format
  ```json
  {
    "error": "Invalid request",
    "details": [{ "message": "Invalid course ID" }]
  }
  ```
- `401 Unauthorized` - No valid session
- `404 Not Found` - Course not found
- `403 Forbidden` - Course not published
- `409 Conflict` - Already enrolled
- `500 Internal Server Error` - Server error

---

### GET /api/enrollments/[id]

Get detailed enrollment information including progress tracking.

**Authentication:** Required **Parameters:**

- `id` (path) - Enrollment UUID

**Response:** 200 OK

```json
{
  "id": "enrollment-uuid",
  "userId": "user-uuid",
  "courseId": "course-uuid",
  "status": "active",
  "progress": 45,
  "completedAt": null,
  "enrolledAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-03T12:00:00Z",
  "user": {
    "email": "user@example.com",
    "id": "user-uuid"
  },
  "progress": {
    "modulesComplete": 2,
    "lessonsComplete": 8,
    "lastAccessedAt": "2025-01-03T13:00:00Z"
  }
}
```

**Error Responses:**

- `401 Unauthorized` - No valid session
- `403 Forbidden` - User doesn't own this enrollment
- `404 Not Found` - Enrollment not found
- `500 Internal Server Error` - Server error

---

## Locale Support

All text content (course titles, descriptions, lesson content) is returned in the user's preferred locale:

**Supported Locales:**

- `en` - English
- `es` - Spanish
- `pt` - Portuguese
- `hi` - Hindi
- `zh` - Chinese
- `de` - German
- `hu` - Hungarian

**Locale Selection:**

1. Uses `session.user.locale` if authenticated
2. Falls back to `en` (English) if not set or unauthenticated
3. Updates via PATCH `/api/user/language`

---

## Error Handling

All endpoints follow consistent error response patterns:

**Standard Error Response:**

```json
{
  "error": "Error message",
  "details": {} // Optional: Additional error information
}
```

**Common Status Codes:**

- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input (Zod validation error)
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Authenticated but insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., already enrolled)
- `500 Internal Server Error` - Server error

---

## Implementation Details

### Request Structure

All endpoints use:

- **Method:** HTTP (GET, POST, PATCH)
- **Content-Type:** `application/json`
- **Authentication:** Auth.js session cookie

### Response Structure

All successful responses return JSON with typed data matching Prisma schema:

- User fields from `model User`
- Course data with `CourseTranslation` content
- Module/Lesson nested with translations
- Enrollment tracking with `CourseProgress`

### Validation

Input validation uses Zod schemas:

- `updateProfileSchema` - User profile updates
- `enrollmentSchema` - Enrollment creation
- Enum validation for locales
- UUID validation for IDs

---

## Testing Endpoints

### Using curl

```bash
# Get all courses
curl -X GET http://localhost:3000/api/courses

# Get specific course
curl -X GET http://localhost:3000/api/courses/[course-id]

# Get user enrollments (requires session)
curl -X GET http://localhost:3000/api/enrollments \
  -H "Cookie: [session-cookie]"

# Enroll in course
curl -X POST http://localhost:3000/api/enrollments \
  -H "Content-Type: application/json" \
  -H "Cookie: [session-cookie]" \
  -d '{"courseId": "[course-id]"}'

# Update user profile
curl -X PATCH http://localhost:3000/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: [session-cookie]" \
  -d '{"name": "New Name"}'

# Update language preference
curl -X PATCH http://localhost:3000/api/user/language \
  -H "Content-Type: application/json" \
  -H "Cookie: [session-cookie]" \
  -d '{"locale": "es"}'

# Get course progress
curl -X GET http://localhost:3000/api/progress/[course-id] \
  -H "Cookie: [session-cookie]"

# Mark lesson as complete
curl -X PATCH http://localhost:3000/api/progress/[course-id]/lesson \
  -H "Content-Type: application/json" \
  -H "Cookie: [session-cookie]" \
  -d '{"lessonId": "[lesson-id]"}'

# Mark module as complete
curl -X PATCH http://localhost:3000/api/progress/[course-id]/module \
  -H "Content-Type: application/json" \
  -H "Cookie: [session-cookie]" \
  -d '{"moduleId": "[module-id]"}'
```

### Using TypeScript Client

```typescript
// Fetch user profile
const response = await fetch('/api/user/profile');
const profile = await response.json();

// Enroll in course
const enrollResponse = await fetch('/api/enrollments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ courseId: 'course-id' }),
});
const enrollment = await enrollResponse.json();

// List courses with filters
const coursesResponse = await fetch('/api/courses');
const courses = await coursesResponse.json();
```
