# API Test

Test API endpoints quickly using curl or httpie.

## Instructions

Test API endpoints with proper authentication and formatting.

### Step 1: Get Authentication Token

```bash
# For protected endpoints, get a session token
# Option 1: Login via browser and copy cookie
# Option 2: Use test credentials with curl

# Login and capture session cookie
curl -c cookies.txt -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email": "student@example.com", "password": "password123"}'
```

### Step 2: Test Endpoints

#### Public Endpoints (No Auth)

```bash
# Health check
curl http://localhost:3000/api/health | jq

# List courses (public)
curl "http://localhost:3000/api/courses?page=1&limit=10" | jq

# Get single course
curl http://localhost:3000/api/courses/domain-driven-design | jq
```

#### Protected Endpoints (With Auth)

```bash
# Using cookie file
curl -b cookies.txt http://localhost:3000/api/user/profile | jq

# Using session token directly
curl -H "Cookie: authjs.session-token=<token>" \
  http://localhost:3000/api/enrollments | jq
```

### Step 3: Common Test Scenarios

#### GET Request with Query Parameters

```bash
curl -X GET "http://localhost:3000/api/courses?page=1&limit=5&locale=en" \
  -H "Accept: application/json" | jq
```

#### POST Request with JSON Body

```bash
curl -X POST http://localhost:3000/api/enrollments \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=<token>" \
  -d '{"courseId": "uuid-here"}' | jq
```

#### PUT Request

```bash
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=<token>" \
  -d '{"name": "Updated Name", "bio": "New bio"}' | jq
```

#### DELETE Request

```bash
curl -X DELETE http://localhost:3000/api/enrollments/uuid-here \
  -H "Cookie: authjs.session-token=<token>" | jq
```

### API Endpoint Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health` | GET | No | Health check |
| `/api/courses` | GET | No | List courses |
| `/api/courses/[slug]` | GET | No | Get course by slug |
| `/api/enrollments` | GET | Yes | User's enrollments |
| `/api/enrollments` | POST | Yes | Enroll in course |
| `/api/progress` | GET | Yes | Course progress |
| `/api/progress` | PUT | Yes | Update progress |
| `/api/user/profile` | GET | Yes | Get profile |
| `/api/user/profile` | PUT | Yes | Update profile |
| `/api/user/language` | PUT | Yes | Update locale |
| `/api/register` | POST | No | Register user |

### Test Scenarios

#### Test Validation

```bash
# Test with invalid email
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid", "password": "test123"}' | jq

# Expected: 400 with validation errors
```

#### Test Authentication

```bash
# Test without auth token
curl http://localhost:3000/api/user/profile | jq

# Expected: 401 Unauthorized
```

#### Test Authorization

```bash
# Test accessing another user's data
curl -X GET "http://localhost:3000/api/enrollments/other-user-id" \
  -H "Cookie: authjs.session-token=<token>" | jq

# Expected: 403 Forbidden
```

#### Test Pagination

```bash
# First page
curl "http://localhost:3000/api/courses?page=1&limit=5" | jq '.meta'

# Second page
curl "http://localhost:3000/api/courses?page=2&limit=5" | jq '.meta'
```

### Response Validation

```bash
# Check response status
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health

# Check response time
curl -s -o /dev/null -w "%{time_total}s" http://localhost:3000/api/courses

# Check response headers
curl -I http://localhost:3000/api/courses
```

### Using HTTPie (Alternative)

```bash
# GET request
http GET localhost:3000/api/courses page==1 limit==10

# POST request
http POST localhost:3000/api/enrollments \
  Cookie:authjs.session-token=<token> \
  courseId=uuid-here

# With JSON file
http POST localhost:3000/api/register < request.json
```

## Test Script Template

```bash
#!/bin/bash
# scripts/test-api.sh

BASE_URL="http://localhost:3000"
TOKEN="your-session-token"

echo "🧪 Testing API Endpoints"
echo "========================"

# Health check
echo -n "Health Check: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/health)
[ "$STATUS" = "200" ] && echo "✅ $STATUS" || echo "❌ $STATUS"

# Public endpoint
echo -n "List Courses: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/courses")
[ "$STATUS" = "200" ] && echo "✅ $STATUS" || echo "❌ $STATUS"

# Protected endpoint without auth
echo -n "Profile (no auth): "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/user/profile)
[ "$STATUS" = "401" ] && echo "✅ $STATUS (expected)" || echo "❌ $STATUS"

# Protected endpoint with auth
echo -n "Profile (with auth): "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Cookie: authjs.session-token=$TOKEN" \
  $BASE_URL/api/user/profile)
[ "$STATUS" = "200" ] && echo "✅ $STATUS" || echo "❌ $STATUS"

echo "========================"
echo "🏁 Tests complete"
```

## Usage

```bash
# Test all endpoints
/api-test

# Test specific endpoint
/api-test GET /api/courses

# Test with auth
/api-test --auth POST /api/enrollments

# Run test script
/api-test --script
```
