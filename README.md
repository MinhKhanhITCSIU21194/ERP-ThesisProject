# ERP System - Backend

This is the backend component of the ERP System thesis project built with Node.js and Express.

## Features

- RESTful API built with Express.js
- CORS enabled for cross-origin requests
- Environment variable configuration with dotenv
- Hot reload with nodemon during development
- Structured folder organization
- Error handling middleware
- Health check endpoint

## Project Structure

```
back-end/
├── src/
│   ├── app.js              # Main application file
│   ├── routes/             # API routes
│   │   ├── index.js        # Routes index
│   │   └── users.js        # User routes (example)
│   ├── controllers/        # Business logic controllers
│   ├── models/             # Data models
│   ├── middleware/         # Custom middleware
│   └── utils/              # Utility functions
├── .env                    # Environment variables
├── .gitignore             # Git ignore file
├── nodemon.json           # Nodemon configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the `.env` file and configure your environment variables

### Development

Run the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production

Run the production server:
```bash
npm start
```

## API Endpoints

### Base URL
`http://localhost:3000`

### Available Endpoints

- `GET /` - Welcome message and API info
- `GET /api/health` - Health check endpoint
- `GET /api/users` - Get all users (example)
- `GET /api/users/:id` - Get user by ID (example)
- `POST /api/users` - Create new user (example)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=3000
```

## Development Guidelines

- Add new routes in the `src/routes/` directory
- Create controllers in `src/controllers/` for business logic
- Add models in `src/models/` for data structures
- Use middleware in `src/middleware/` for reusable functionality
- Place utility functions in `src/utils/`

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test your changes
4. Commit and push to your branch
5. Create a pull request
