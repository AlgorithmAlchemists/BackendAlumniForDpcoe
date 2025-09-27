# API Endpoints and Required Fields

| API Endpoint                       | HTTP Method | Controller Function   | Required Fields (Request Body)         | Variable Names in Code                   |
|-------------------------------------|-------------|----------------------|----------------------------------------|------------------------------------------|
| /api/v1/Auth/institute/signup       | POST        | signUpInstitute      | Name, email, location, pass            | Name, email, location, pass, website (optional) |
| /api/v1/Auth/institute/signin       | POST        | loginInstitute       | email, pass                            | email, pass                             |

## Field Details

| Field Name | Description                | Required | Notes                |
|------------|----------------------------|----------|----------------------|
| Name       | Institute name             | Yes      |                      |
| email      | Institute email            | Yes      |                      |
| location   | Institute location         | Yes      |                      |
| pass       | Institute password         | Yes      | Will be hashed       |
| website    | Institute website          | No       | Defaults to null     |

*All fields are expected in the JSON body of the POST request.*