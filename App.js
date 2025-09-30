const express = require('express')
require('dotenv').config();
const cors = require("cors");

// import middlewares
const cookieParser = require("cookie-parser");

//import routes
const AuthRoute = require('./Routes/Auth.Route.js');
const JobsRoute = require('./Routes/Jobs.Route.js');
const checkToken = require('./Middlewares/jwtVerify.Middlewares.js');






const app = express()

// Middleware 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkToken("token"))

// app.use(cors({
//   origin: process.env.FRONTEND_URL, 
//   credentials: true,
//   methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
//   allowedHeaders: "Content-Type, Authorization"
// }));
// app.options('*', cors({
//   origin: process.env.FRONTEND_URL,  // Your frontend domain for preflight requests
//   credentials: true
// }));
// app.use((req,res,next)=>{
//   console.log("in")
//   next()
// })

// app.use((req,res,next)=>{
//   console.log("in")
//   next()
// })

app.use('/api/v1/Auth',AuthRoute);


// Protected routes (token required)
app.use('/api/v1/jobs', checkToken("token"), JobsRoute);


app.listen(7000, () => console.log('Server running on 7000'))
