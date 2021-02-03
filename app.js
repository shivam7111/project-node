var express = require('express')
var app = express()
require('dotenv').config()
var mkdirp = require('mkdirp')
const bodyParser = require('body-parser')
const routes = require('./src/routes')
var cors = require('cors')
const PORT = 8081

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '60mb' }))

app.use(express.static('public'))

var uploadsDir = process.env.UPLOADS_DIR
mkdirp.sync(uploadsDir)
app.use('/uploads', express.static(uploadsDir))

routes(app)

app.listen(PORT)
