const express = require('express')
const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')
const organisationRouter = require('./routes/organisation')
require('dotenv').config()

const app = express()

const PORT = process.env.PORT || 81

app.use(express.json())

app.use('/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/organisations', organisationRouter)

app.get('/', (req, res) => {
    res.send('Hello....nndh.')
})

app.listen(PORT, () => {
    console.log("Running express server on port: " + PORT)
})
