const Sequelize = require('sequelize')
var db = require('./platform.db')

console.log(db)

let dbHost = db.host
let dbUsername = db.user
let dbPassword = db.password
let dbDatabase = db.database

const sequelize = new Sequelize(dbDatabase, dbUsername, dbPassword, {
  host: dbHost,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

module.exports = {
  sequelize,
  Sequelize
}