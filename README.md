# Project Management System

A comprehensive project management system built with Django (backend) and React/TypeScript (frontend). This system supports company registration, user management, team creation, project tracking, and task assignment.

## Features

### Authentication & User Management
- Company registration (for companies and freelancers)
- User authentication with JWT tokens
- Role-based access control (Admin, Manager, Member, Viewer)
- User profile management

### Company Management
- Multi-company support
- Company owner and employee management
- Role-based permissions

### Team Management
- Create and manage teams within companies
- Assign team leads and members
- Team-based project assignments

### Project Management
- Create and manage projects
- Assign projects to individuals or teams
- Project status tracking (Planning, Active, On Hold, Completed, Cancelled)
- Priority levels (Low, Medium, High, Urgent)
- Progress tracking and completion percentage

### Task Management
- Create tasks within projects
- Assign tasks to individual users
- Task status tracking (To Do, In Progress, Review, Completed, Cancelled)
- Task comments and discussions
- Time tracking (estimated vs actual hours)

## Technology Stack

### Backend
- **Django 5.2.4** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database
- **JWT Authentication** - Token-based authentication
- **Django CORS Headers** - Cross-origin requests

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **React Router** - Routing
- **Axios** - HTTP client
- **React Query** - Server state management

## Project Structure

```
.
├── backend/                 # Django backend
│   ├── accounts/           # User and company management
│   ├── teams/              # Team management
│   ├── projects/           # Project and task management
│   ├── project_management/ # Main Django project
│   ├── requirements.txt    # Python dependencies
│   └── .env.example       # Environment variables template
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── lib/               # API services and utilities
│   ├── pages/             # Page components
│   └── providers/         # Theme and other providers
├── package.json           # Node.js dependencies
└── README.md
```

## Setup Instructions

### Prerequisites
- Python 3.8+ 
- Node.js 16+
- PostgreSQL 12+

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   
   # Database Configuration
   DB_NAME=project_management
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

5. **Create PostgreSQL database:**
   ```sql
   CREATE DATABASE project_management;
   CREATE USER your_db_user WITH PASSWORD 'your_db_password';
   GRANT ALL PRIVILEGES ON DATABASE project_management TO your_db_user;
   ```

6. **Run database migrations:**
   ```bash
   python manage.py migrate
   ```

7. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

8. **Start the development server:**
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd ..  # if you're in the backend directory
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Company registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/current-user/` - Get current user
- `PATCH /api/auth/profile/` - Update user profile

### Projects
- `GET /api/projects/` - List all projects
- `POST /api/projects/` - Create new project
- `GET /api/projects/{id}/` - Get project details
- `PATCH /api/projects/{id}/` - Update project
- `DELETE /api/projects/{id}/` - Delete project

### Tasks
- `GET /api/tasks/` - List all tasks
- `POST /api/tasks/` - Create new task
- `GET /api/tasks/{id}/` - Get task details
- `PATCH /api/tasks/{id}/` - Update task
- `DELETE /api/tasks/{id}/` - Delete task

### Teams
- `GET /api/teams/` - List all teams
- `POST /api/teams/` - Create new team
- `GET /api/teams/{id}/` - Get team details
- `PATCH /api/teams/{id}/` - Update team
- `DELETE /api/teams/{id}/` - Delete team

## Usage

### Getting Started

1. **Register a Company:**
   - Visit `http://localhost:5173/register`
   - Fill in company details and owner information
   - Choose between "Company" or "Freelancer" type

2. **Login:**
   - Visit `http://localhost:5173/login`
   - Use your credentials to sign in

3. **Create Projects:**
   - From the dashboard, click "Create Project"
   - Fill in project details
   - Assign teams or users if needed

4. **Manage Tasks:**
   - Navigate to a project
   - Create tasks and assign them to users
   - Track progress and update status

5. **Team Management:**
   - Create teams from the Teams section
   - Add members and assign team leads
   - Assign teams to projects

### User Roles

- **Admin:** Full access to all features
- **Manager:** Can create projects, teams, and manage users
- **Member:** Can view and update assigned tasks and projects
- **Viewer:** Read-only access to projects and tasks

## Development

### Running Tests
```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
npm run test
```

### Building for Production
```bash
# Build frontend
npm run build

# Collect static files (Django)
cd backend
python manage.py collectstatic
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
