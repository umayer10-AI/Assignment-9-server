const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')
const port = process.env.PORT || 5000
dotenv.config()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
