const express = require('express')
require('dotenv').config();
const cors = require("cors");

// import middlewares
const cookieParser = require("cookie-parser");

//import routes
const AuthRoute = require('./Routes/Auth.Route.js');
const ChatRoute = require('./Routes/Chat.Route.js');
const JobsRoute = require('./Routes/Jobs.Route.js');

// custom middlewares
const checkToken = require('./Middlewares/jwtVerify.Middlewares.js');






const app = express()
const port = process.env.PORT || 7000

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

app.use('/api/v1/Auth', AuthRoute)
app.use('/api/v1/Chat', ChatRoute)
app.use('/api/v1/jobs', JobsRoute);

app.get('/', (req, res) => {
  res.send(`Server running on ${port}`)
})


app.listen(port, () => console.log(`Server running on ${port}`))
