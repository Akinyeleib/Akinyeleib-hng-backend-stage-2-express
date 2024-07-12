const app = require('./app')
require('dotenv').config()

const PORT = process.env.PORT || 81

app.listen(PORT, () => {
    console.log("Running express server on port: " + PORT)
})
