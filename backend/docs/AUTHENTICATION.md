# JWT Authentication System

This Django app uses JWT (JSON Web Tokens) for authentication. The system is simple but functional and works with MongoEngine models.

## Features

- **JWT Token Generation**: Secure tokens with 1-day expiration
- **Automatic User Authentication**: All protected endpoints automatically get the authenticated user
- **Role-Based Permissions**: Admin-only operations for certain endpoints
- **Secure Password Hashing**: SHA256 password hashing

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set JWT Secret Key
Add to your `.env` file:
```env
JWT_SECRET_KEY=your-super-secret-jwt-key-here
```

## API Usage

### 1. User Registration
```bash
POST /api/auth/register/
Content-Type: application/json

{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
}
```

**Response:**
```json
{
    "user": { ... },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "message": "User registered successfully"
}
```

### 2. User Login
```bash
POST /api/auth/login/
Content-Type: application/json

{
    "email": "test@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "user": { ... },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "message": "Login successful"
}
```

### 3. Using Protected Endpoints
Include the JWT token in the Authorization header:

```bash
GET /api/users/profile/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## Protected Endpoints

### User Management
- `GET /api/users/profile/` - Get user profile
- `PUT /api/users/profile/` - Update user profile
- `PUT /api/users/password/` - Change password
- `POST /api/users/upload-photo/` - Upload profile photo

### Posts
- `GET /api/posts/` - List all posts
- `POST /api/posts/` - Create new post
- `PUT /api/posts/{id}/` - Update post (owner only)
- `DELETE /api/posts/{id}/` - Delete post (owner only)

### Donations
- `POST /api/donations/` - Submit donation
- `GET /api/donations/post/{id}/` - Get post donations
- `GET /api/donations/user/{id}/` - Get user donations

### Items
- `POST /api/items/` - Donate item
- `GET /api/items/` - List available items
- `PUT /api/items/{id}/claim/` - Claim item

## Admin-Only Endpoints

These endpoints require `is_staff=True`:

### Badges
- `POST /api/badges/assign/` - Assign badge to user

### Blogs
- `POST /api/blogs/` - Create blog
- `PUT /api/blogs/{id}/` - Update blog
- `DELETE /api/blogs/{id}/` - Delete blog

### Donations
- `PUT /api/donations/{id}/verify/` - Verify donation

## Token Structure

JWT tokens contain the following payload:
- `user_id`: User's unique identifier
- `username`: User's username
- `email`: User's email
- `exp`: Expiration timestamp (1 day from creation)
- `iat`: Issued at timestamp

## Security Features

1. **Token Expiration**: Tokens expire after 1 day
2. **Password Hashing**: SHA256 hashing for passwords
3. **User Validation**: Checks if user exists and is active
4. **Ownership Verification**: Users can only modify their own content
5. **Admin Permissions**: Admin operations require staff privileges

## Error Handling

Common authentication errors:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `400 Bad Request`: Invalid request data

## Frontend Integration

### Storing Token
```javascript
// After login/registration
localStorage.setItem('jwt_token', response.data.token);
```

### Using Token
```javascript
const token = localStorage.getItem('jwt_token');
const response = await fetch('/api/users/profile/', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});
```

### Removing Token
```javascript
// On logout
localStorage.removeItem('jwt_token');
```

## Example Usage

### Complete Authentication Flow
```bash
# 1. Register user
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# 2. Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Use protected endpoint
curl -X GET http://localhost:8000/api/users/profile/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

This authentication system provides a solid foundation for your Pet Adoption Platform API! 🚀
