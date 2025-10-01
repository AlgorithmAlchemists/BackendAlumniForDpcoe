const express = require('express')
require('dotenv').config();
const http = require('http');
const socketService = require('./Services/socket.Services.js')

const app = express()

const cors = require("cors");
// import middlewares
const cookieParser = require("cookie-parser");

//import routes
const AuthRoute = require('./Routes/Auth.Route.js');
const ChatRoute = require('./Routes/Chat.Route.js');
const JobsRoute = require('./Routes/Jobs.Route.js');
const AdminDashboardRoute = require('./Routes/adminDashboard.Route.js');
// custom middlewares
const checkToken = require('./Middlewares/jwtVerify.Middlewares.js');

// socket middleware
const {socketAuth, mapIo} = require('./SocketMiddleware/socketVerify.SocketMiddleware.js');




const port = process.env.PORT || 7000

// Middleware 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkToken("token"))

app.use(cors({
  origin: process.env.FRONTEND_URL, 
  credentials: true,
  methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
  allowedHeaders: "Content-Type, Authorization"
}));
app.options('*', cors({
  origin: process.env.FRONTEND_URL,  // Your frontend domain for preflight requests
  credentials: true
}));

//create server and pass to socket service
const server = http.createServer(app);
const io = socketService(server); 

// socket middleware
 
app.use(mapIo(io)); // Apply socket authentication middleware

app.use('/api/v1/Auth', AuthRoute)
app.use('/api/v1/Chat', ChatRoute)
app.use('/api/v1/jobs', JobsRoute);
app.use('/api/v1/admin', AdminDashboardRoute);

app.get('/', (req, res) => {
  res.send(`Server running on ${port}`)
})


server.listen(port, () => console.log(`Server running on ${port}`))
