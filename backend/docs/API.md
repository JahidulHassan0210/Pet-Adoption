# Pet Adoption Platform API Documentation

## Base URL
```
http://localhost:8000/api/
```

## Authentication
All API endpoints require authentication except for registration and login.

### Register User
```
POST /api/auth/register/
```
**Body:**
```json
{
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "password": "secure_password",
    "confirm_password": "secure_password",
    "nid_photo": "file_upload"
}
```

### Login
```
POST /api/auth/login/
```
**Body:**
```json
{
    "email": "john@example.com",
    "password": "secure_password"
}
```

### Logout
```
POST /api/auth/logout/
```
**Headers:** Authorization: Token {token}

## User Profile

### Get Profile
```
GET /api/users/profile/
```
**Headers:** Authorization: Token {token}

### Update Profile
```
PUT /api/users/profile/update/
```
**Headers:** Authorization: Token {token}
**Body:**
```json
{
    "first_name": "John",
    "last_name": "Smith",
    "location": "Dhaka, Bangladesh",
    "bio": "Pet lover and volunteer"
}
```

### Change Password
```
PUT /api/users/password/change/
```
**Headers:** Authorization: Token {token}
**Body:**
```json
{
    "old_password": "current_password",
    "new_password": "new_secure_password",
    "confirm_password": "new_secure_password"
}
```

### Upload Photo
```
POST /api/users/upload-photo/
```
**Headers:** Authorization: Token {token}
**Body:** Form data with 'photo' field

## Badges

### Get All Badges
```
GET /api/badges/
```
**Headers:** Authorization: Token {token}

### Get User Badges
```
GET /api/badges/user/{user_id}/
```
**Headers:** Authorization: Token {token}

### Assign Badge (Admin Only)
```
POST /api/badges/assign/
```
**Headers:** Authorization: Token {token}
**Body:**
```json
{
    "user": "user_uuid",
    "badge": "badge_uuid"
}
```

## Blogs

### Get All Blogs
```
GET /api/blogs/
```
**Headers:** Authorization: Token {token}

### Get Specific Blog
```
GET /api/blogs/{blog_id}/
```
**Headers:** Authorization: Token {token}

### Create Blog (Admin Only)
```
POST /api/blogs/create/
```
**Headers:** Authorization: Token {token}
**Body:**
```json
{
    "title": "Pet Care Tips",
    "content": "Here are some essential pet care tips...",
    "image": "file_upload",
    "tags": ["care", "tips", "pets"]
}
```

### Update Blog (Admin Only)
```
PUT /api/blogs/{blog_id}/update/
```
**Headers:** Authorization: Token {token}

### Delete Blog (Admin Only)
```
DELETE /api/blogs/{blog_id}/delete/
```
**Headers:** Authorization: Token {token}

## Posts

### Get All Posts
```
GET /api/posts/
```
**Headers:** Authorization: Token {token}

### Get Specific Post
```
GET /api/posts/{post_id}/
```
**Headers:** Authorization: Token {token}

### Create Post
```
POST /api/posts/create/
```
**Headers:** Authorization: Token {token}
**Body:**
```json
{
    "type": "adoption",
    "title": "Cute Puppy for Adoption",
    "description": "Looking for a loving home...",
    "pet_type": "dog",
    "pet_age": 2,
    "pet_size": "medium",
    "pet_species": "Golden Retriever",
    "donation_goal": 500.00
}
```

### Update Post
```
PUT /api/posts/{post_id}/update/
```
**Headers:** Authorization: Token {token}

### Delete Post
```
DELETE /api/posts/{post_id}/delete/
```
**Headers:** Authorization: Token {token}

### Get User Posts
```
GET /api/posts/user/{user_id}/
```
**Headers:** Authorization: Token {token}

### Add Images to Post
```
POST /api/posts/{post_id}/images/
```
**Headers:** Authorization: Token {token}
**Body:** Form data with 'image_url' and 'caption' fields

## Donations

### Submit Donation
```
POST /api/donations/
```
**Headers:** Authorization: Token {token}
**Body:**
```json
{
    "post": "post_uuid",
    "amount": 50.00,
    "payment_method": "bkash",
    "reference_id": "BK123456789",
    "receipt_image": "file_upload"
}
```

### Get Post Donations
```
GET /api/donations/post/{post_id}/
```
**Headers:** Authorization: Token {token}

### Get User Donations
```
GET /api/donations/user/{user_id}/
```
**Headers:** Authorization: Token {token}

### Verify Donation (Admin Only)
```
PUT /api/donations/{donation_id}/verify/
```
**Headers:** Authorization: Token {token}
**Body:**
```json
{
    "status": "verified"
}
```

## Items

### Donate Item
```
POST /api/items/
```
**Headers:** Authorization: Token {token}
**Body:**
```json
{
    "post": "post_uuid",
    "item_type": "food",
    "item_name": "Premium Dog Food",
    "description": "High-quality dog food",
    "quantity": 5,
    "image": "file_upload"
}
```

### Get Available Items
```
GET /api/items/available/
```
**Headers:** Authorization: Token {token}

### Get Post Items
```
GET /api/items/post/{post_id}/
```
**Headers:** Authorization: Token {token}

### Claim Item
```
PUT /api/items/{item_id}/claim/
```
**Headers:** Authorization: Token {token}

## Response Format

### Success Response
```json
{
    "id": "uuid",
    "message": "Success message",
    "data": {...}
}
```

### Error Response
```json
{
    "error": "Error message",
    "detail": "Detailed error information"
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Pagination

List endpoints support pagination with the following query parameters:
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 20)

## Filtering

Many endpoints support filtering with query parameters:
- `search` - Search in text fields
- `ordering` - Sort by specific fields
- Various model-specific filters

## File Uploads

For file uploads, use `multipart/form-data` content type:
- Profile photos: `photo` field
- NID photos: `nid_photo` field
- Post images: `image_url` field
- Receipt images: `receipt_image` field
- Item images: `image` field
- Blog images: `image` field
