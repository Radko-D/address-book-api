# Address Book API

## Overview

The Address Book API is a NestJS-based application that provides a comprehensive contact management system. It allows users to create, manage, and organize contacts with features like custom fields, tagging, and various export options. The application uses PostgreSQL for data storage and implements JWT-based authentication.

## Technology Stack

- Backend Framework: NestJS
- Database: PostgreSQL
- ORM: TypeORM
- Authentication: JWT (JSON Web Tokens)
- Export Formats: CSV, JSON, XLSX

## Core Entities

### User

The User entity represents system users who can manage their contacts. Each user has:

- Unique ID (UUID)
- Email (unique)
- First Name
- Last Name
- Password (hashed)
- Refresh Token
- Created/Updated timestamps
- Relationship with Tags

### UserRecord (Contact)

Represents a contact in the address book with fields:

- First Name
- Last Name (optional)
- Company Name (optional)
- Address (optional)
- Phone Number
- Email (optional)
- Fax Number (optional)
- Mobile Phone Number (optional)
- Comment (optional)
- Created/Updated timestamps
- Relationships with Tags and Custom Fields

### Tag

Allows categorization of contacts:

- Name
- Color
- User association
- Created/Updated timestamps
- Many-to-many relationship with UserRecords

### CustomField

Enables adding custom attributes to contacts:

- Name
- Value
- Record association
- Created/Updated timestamps

## Authentication

The API implements a secure authentication system using JWT with refresh tokens:

### Endpoints

- POST `/api/auth/login`: Authenticates user and returns access token
- POST `/api/auth/refresh`: Refreshes access token using refresh token
- POST `/api/auth/logout`: Invalidates refresh token
- POST `/api/auth/register`: Creates new user account
- PATCH `/api/auth/update`: Updates user profile

### Security Features

- Access tokens expire after 30 minutes
- Refresh tokens expire after 7 days
- HTTP-only cookies for refresh tokens
- Password hashing using bcrypt
- JWT-based route protection

## API Endpoints

### User Records (Contacts)

- GET `/api/user-record`: Retrieves all records with pagination
- GET `/api/user-record/:recordId`: Gets specific record
- POST `/api/user-record`: Creates new record
- POST `/api/user-record/update/:recordId`: Updates existing record
- DELETE `/api/user-record/delete`: Deletes record
- GET `/api/user-record/export-records`: Exports records in CSV/JSON/XLSX format

#### Query Parameters for Records

- `mostUsedTags`: Filter by most frequently used tags
- `sameFirstNameDiffLastName`: Find records with same first name but different last names
- `sameLastNameDiffFirstName`: Find records with same last name but different first names
- `firstName`: Filter by first name
- `lastName`: Filter by last name
- `page`: Pagination page number
- `limit`: Records per page

### Tags

- GET `/api/tag`: Lists all tags
- POST `/api/tag`: Creates new tag
- PATCH `/api/tag/:tagId`: Updates tag
- DELETE `/api/tag/delete`: Deletes tag
- POST `/api/tag/:tagId/records/:recordId`: Associates tag with record
- DELETE `/api/tag/:tagId/records/:recordId`: Removes tag from record

### Custom Fields

- POST `/api/custom-field/:recordId`: Creates custom field for record
- PATCH `/api/custom-field/:fieldId`: Updates custom field
- DELETE `/api/custom-field/:fieldId`: Deletes custom field

## Services

### UserService

Handles user-related operations:

- User registration and profile management
- Password hashing and verification
- JWT token generation and management
- Refresh token handling

### UserRecordService

Manages contact records:

- CRUD operations for contacts
- Record filtering and searching
- Export functionality in multiple formats
- Relationship management with tags

### TagService

Handles tag operations:

- Tag creation and management
- Association with records
- Access control verification

### CustomFieldService

Manages custom fields:

- Field creation and management
- Validation of field ownership
- Association with records

## Data Access Layer

### Repositories

Each entity has a dedicated repository handling database operations:

- UserRepository
- UserRecordRepository
- TagRepository
- CustomFieldRepository

## Error Handling

The API implements comprehensive error handling with custom exceptions:

- CustomFieldNotFoundException
- UnauthorizedCustomFieldAccessException
- TagNotFoundException
- UnauthorizedTagAccessException
- Various operation-specific exceptions

## Data Export

The API supports exporting contact data in multiple formats:

- CSV: Comma-separated values format
- JSON: JavaScript Object Notation format
- XLSX: Excel spreadsheet format

Export functionality includes:

- All basic contact fields
- Associated tags
- Custom fields
- Timestamps

## Security Considerations

- All routes except authentication endpoints require JWT authentication
- Password hashing for user credentials
- Refresh token rotation
- CORS configuration for frontend access
- HTTP-only cookies for sensitive tokens
- User ownership validation for all operations

## Database Management

- TypeORM migrations for database schema management
- Automatic timestamp handling
- Cascading deletes for related entities
- Foreign key constraints
- UUID primary keys for security

## Environment Configuration

Required environment variables:

- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_DATABASE`: Database name
- `JWT_SECRET`: Secret for access tokens
- `JWT_REFRESH_SECRET`: Secret for refresh tokens
- `PORT`: Application port (defaults to 3000)

## Running the Application

```bash
# Installation
npm install

# Database migrations
npm run migration:generate
npm run migration:run

# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Testing

The application includes e2e testing setup:

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```
