import express from 'express'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'  

const app = express()

// Middleware to verify Clerk token
app.use(ClerkExpressWithAuth())

app.listen(7000, () => console.log('Server running on 7000'))
