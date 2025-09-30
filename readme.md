# API Endpoints and Required Fields

| API Endpoint                                   | HTTP Method | Controller Function   | Required Fields (Request Body)                                                                 | Variable Names in Code                                         |
|------------------------------------------------|-------------|----------------------|-----------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| /api/v1/Auth/institute/signup                  | POST        | signUpInstitute      | Name, email, location, pass                                                                   | Name, email, location, pass, website (optional)                |
| /api/v1/Auth/institute/signin                  | POST        | loginInstitute       | email, pass                                                                                   | email, pass                                                    |
| /api/v1/Auth/institute/createAdmin             | POST        | createAdmin          | username, email, pass, access                                                                 | username, email, pass, access                                  |
| /api/v1/Auth/institute/admin/signin            | POST        | loginAdmin           | email, pass                                                                                   | email, pass                                                    |
| /api/v1/Auth/user/alumni/signup                | POST        | alumniSignup         | fName, email, pass, currentCompany, Dob, gradYear, gender, instituteId                        | fName, lName (optional), email, pass, currentCompany, Dob, gradYear, gender, department (optional), linkedin (optional), instituteId |
| /api/v1/Auth/user/alumni/signin                | POST        | signinAlumni         | email, pass                                                                                   | email, pass                                                    |
| /api/v1/Auth/user/student/signup               | POST        | signupStudent        | fName, email, pass, Dob, currentYear, department, instituteId, gender                         | fName, lName (optional), email, pass, Dob, currentYear, department, instituteId, gender           |
| /api/v1/Auth/user/student/signin               | POST        | signinStudent        | email, pass                                                                                   | email, pass                                                    |

## Field Details

| Field Name      | Description                       | Required | Notes                                                      |
|-----------------|-----------------------------------|----------|------------------------------------------------------------|
| Name            | Institute name                    | Yes      |                                                            |
| email           | Email address                     | Yes      | Used for all user types                                    |
| location        | Institute location                | Yes      |                                                            |
| pass            | Password                          | Yes      | Will be hashed                                             |
| website         | Institute website                 | No       | Defaults to null                                           |
| username        | Admin username                    | Yes      | For admin creation                                         |
| access          | Admin access array                | Yes      | Example: ["manageUsers","viewReports"]                     |
| fName           | First name                        | Yes      | For alumni and students                                    |
| lName           | Last name                         | No       | Optional                                                   |
| currentCompany  | Alumni's current company          | Yes      | Alumni only                                                |
| Dob             | Date of birth                     | Yes      |                                                            |
| gradYear        | Graduation year                   | Yes      | Alumni only                                                |
| gender          | Gender                            | Yes      |                                                            |
| department      | Department                        | Yes/No   | Required for students, optional for alumni                 |
| linkedin        | LinkedIn profile                  | No       | Alumni only, optional                                      |
| instituteId     | Institute ID                      | Yes      | For alumni and students                                    |
| currentYear     | Current academic year             | Yes      | Students only                                              |

*All fields are expected in the JSON body of the POST request.*

---

## Project Structure

```
.
├── App.js
├── Connection.js
├── README.md
├── package.json
├── package-lock.json
├── node_modules/
├── Controllers/
│   └── Auth.Controllers.js
├── Middlewares/
│   ├── jwtVerify.Middlewares.js
│   └── onlyInstitute.Middlewares.js
├── Routes/
│   └── Auth.Route.js
├── Services/
│   ├── apiError.Services.js
│   ├── apiResponse.Services.js
│   ├── asyncHandler.Services.js
│   ├── hashPassword.Services.js
│   └── jwt.Services.js
```