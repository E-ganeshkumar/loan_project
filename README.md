# Python Full Stack Loan API

## Project Overview

This project is a backend REST API developed using Python, Django, Django REST Framework, and MySQL.

The application provides user authentication, lead management, credit score checking, loan eligibility processing, and JWT-based authentication.

## Technologies Used

* Python
* Django
* Django REST Framework
* MySQL
* JWT Authentication
* Insomnia
* Git & GitHub

## Features

* User registration
* User login
* JWT authentication
* JWT token refresh
* Lead creation and management
* Request validation
* Credit score API integration
* Loan eligibility checking
* Database storage
* REST API endpoints

## Project Structure

```text
project/
│
├── manage.py
├── project/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── users/
├── leads/
├── loans/
├── requirements.txt
├── .gitignore
├── README.md
└── database.sql
```

## Installation

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Enter the project

```bash
cd python-fullstack-loan-api
```

### 3. Create virtual environment

```bash
python -m venv env
```

### 4. Activate virtual environment

Windows:

```bash
env\Scripts\activate
```

Linux/Mac:

```bash
source env/bin/activate
```

### 5. Install dependencies

```bash
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file in the project root.

```env
SECRET_KEY=your-secret-key

DB_NAME=af_db
DB_USER=king
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=3306
```

Do not commit the `.env` file to GitHub.

## Database Setup

Create the MySQL database:

```sql
CREATE DATABASE af_db;
```

Run Django migrations:

```bash
python manage.py migrate
```

Alternatively, import the provided SQL dump:

```bash
mysql -u king -p af_db < database.sql
```

## Run the Server

```bash
python manage.py runserver
```

The API will be available at:

```text
http://127.0.0.1:8000/
```

## JWT Authentication

### Login

```http
POST /api/token/
```

Example request:

```json
{
    "username": "testuser",
    "password": "testpassword"
}
```

Example response:

```json
{
    "refresh": "refresh-token",
    "access": "access-token"
}
```

Use the access token in protected API requests:

```text
Authorization: Bearer <access-token>
```

## Token Refresh

```http
POST /api/token/refresh/
```

Example:

```json
{
    "refresh": "refresh-token"
}
```

## API Endpoints

| Method | Endpoint                  | Description        |
| ------ | ------------------------- | ------------------ |
| POST   | `/api/register/`          | Register user      |
| POST   | `/api/token/`             | Login              |
| POST   | `/api/token/refresh/`     | Refresh JWT        |
| GET    | `/api/leads/`             | Get leads          |
| POST   | `/api/leads/`             | Create lead        |
| POST   | `/api/credit-score/<id>/` | Check credit score |

## API Testing

The APIs were tested using Insomnia.

The following features were tested:

* User registration
* JWT login
* JWT token refresh
* Protected API access
* Lead creation
* Lead validation
* Credit score API
* Loan eligibility

## Database Dump

The project includes:

```text
database.sql
```

The SQL dump can be imported into MySQL using:

```bash
mysql -u king -p af_db < database.sql
```

## Run Tests

Run Django checks:

```bash
python manage.py check
```

Run tests:

```bash
python manage.py test
```

## Author

Ganesh Kumar
