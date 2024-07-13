const express = require('express')
const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')
const organisationRouter = require('./routes/organisation')

const app = express()

app.use(express.json())

app.use('/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/organisations', organisationRouter)

app.get('/', (req, res) => {
    res.send('Hello....nndh.')
})

module.exports = app
