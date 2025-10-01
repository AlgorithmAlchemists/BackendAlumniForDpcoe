# API Endpoints and Required Fields

| API Endpoint                                   | HTTP Method | Controller Function      | Required Fields (Request Body / Params)                                                        | Variable Names in Code                                         |
|------------------------------------------------|-------------|-------------------------|-----------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| /api/v1/Auth/institute/signup                  | POST        | signUpInstitute         | name, email, location, pass                                                                   | name, email, location, pass, website (optional)                |
| /api/v1/Auth/institute/signin                  | POST        | loginInstitute          | email, pass                                                                                   | email, pass                                                    |
| /api/v1/Auth/institute/createAdmin             | POST        | createAdmin             | username, email, pass, access                                                                 | username, email, pass, access                                  |
| /api/v1/Auth/institute/admin/signin            | POST        | loginAdmin              | email, pass                                                                                   | email, pass                                                    |
| /api/v1/Auth/user/alumni/signup                | POST        | alumniSignup            | fName, email, pass, currentCompany, Dob, gradYear, gender, instituteId, degree, department                        | fName, lName (optional), email, pass, currentCompany, Dob, gradYear, gender, linkedin (optional), instituteId |
| /api/v1/Auth/user/alumni/signin                | POST        | signinAlumni            | email, pass                                                                                   | email, pass                                                    |
| /api/v1/Auth/user/student/signup               | POST        | signupStudent           | fName, email, pass, Dob, currentYear, department, persuingdegree, instituteId, gender                         | fName, lName (optional), email, pass, Dob, currentYear, department, persuingdegeree, instituteId, gender           |
| /api/v1/Auth/user/student/signin               | POST        | signinStudent           | email, pass                                                                                   | email, pass                                                    |
| /api/v1/Chat/send                              | POST        | sendMessage             | senderId, receiverId, instituteId, content (if no file) or file (if no content)               | senderId, receiverId, content (optional), file (optional), instituteId                             |
| /api/v1/Chat/conversations                     | GET         | getConversations        | (must be logged in and verified)                                                              | -                                                              |
| /api/v1/Chat/messages/:conversationid          | GET         | getAllMessages          | conversationid (URL param), page (optional), limit (optional)                                 | conversationid, page (optional), limit (optional)              |
| /api/v1/Chat/create-new/conversation           | POST        | createNewConversation   | participants (array of user IDs)                                                              | participants                                                   |
| /api/v1/Chat/mark-as-read/:conversationid      | PATCH       | markMessagesAsRead      | conversationid (URL param)                                                                    | conversationid                                                 |
| /api/v1/jobs/create                            | POST        | createJobPost           | jobURL, title, description, company, designation, location, typeOfJob                         | jobURL, title, description, company, designation, location, typeOfJob                               |
| /api/v1/jobs/my-posts                          | GET         | getMyJobPosts           | (must be logged in as alumni)                                                                 | -                                                              |
| /api/v1/jobs/update/:jobId                     | PUT         | updateJobPost           | jobId (param), any updatable job fields (see below)                                           | jobId, jobURL, title, description, company, designation, location, typeOfJob                        |
| /api/v1/jobs/close/:jobId                      | PATCH       | closeJobPost            | jobId (param)                                                                                 | jobId                                                          |
| /api/v1/jobs/all                               | GET         | getAllJobPosts          | (optional query: page, limit, typeOfJob, company, location)                                   | page (optional), limit (optional), typeOfJob (optional), company (optional), location (optional)    |
| /api/v1/jobs/details/:jobId                    | GET         | getJobPostById          | jobId (param)                                                                                 | jobId                                                          |

## Field Details

| Field Name      | Description                       | Required | Notes                                                      |
|-----------------|-----------------------------------|----------|------------------------------------------------------------|
| name            | Institute name                    | Yes      |                                                            |
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
| senderId        | Sender user ID (object or ID)     | Yes      | For chat endpoints                                         |
| receiverId      | Receiver user ID (object or ID)   | Yes      | For chat endpoints                                         |
| content         | Chat message text                 | Yes/No   | Required if no file is sent                                |
| file            | File (image/video/pdf)            | Yes/No   | Required if no content is sent                             |
| participants    | Array of user IDs                 | Yes      | For creating new conversation                              |
| jobURL          | Job posting URL                   | Yes      | For job creation                                           |
| title           | Job title                         | Yes      | For job creation                                           |
| description     | Job description                   | Yes      | For job creation                                           |
| company         | Company name                      | Yes      | For job creation                                           |
| designation     | Designation/role                  | Yes      | For job creation                                           |
| location        | Job location                      | Yes      | For job creation                                           |
| typeOfJob       | Type of job                       | Yes      | Must be one of: Internship, FullTime, PartTime             |
| jobId           | Job post ID                       | Yes      | For job update/close/details                               |
| isopen          | Job open status                   | No       | Managed by backend                                         |
| page, limit     | Pagination for job listing        | No       | Optional query params                                      |
| conversationid  | Conversation ID                   | Yes      | For fetching messages and marking as read                  |

*All fields are expected in the JSON body of the POST/PUT/PATCH request unless otherwise noted. Route params are provided in the URL. Optional fields are marked as (optional) above.*


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
│   ├── Auth.Controllers.js
|   └── Chat.Controllers.js
├── Middlewares/
│   ├── jwtVerify.Middlewares.js
│   ├── onlyInstitute.Middlewares.js
|   ├── multer.Middlewares.js
|   ├── sameInstitute.Middlewares.js
|   └── verified.Middlewars.js 
├── Routes/
│   ├── Auth.Route.js
|   └── Chat.Route.js
├── Services/
│   ├── apiError.Services.js
│   ├── apiResponse.Services.js
│   ├── asyncHandler.Services.js
│   ├── hashPassword.Services.js
│   ├── cloudinary.Services.js
│   └── jwt.Services.js
```