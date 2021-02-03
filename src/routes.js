const Student = require('./controllers/student')

const routes = function (app) {

  app.post('/step1', Student.saveStudentStep1)
  app.post('/step2', Student.saveStudentStep2)
  app.post('/step3', Student.saveStudentStep3)

  app.post('/student', Student.getStudent)

  app.post('/student3', Student.getStudent3)

  app.get('/step1', function (req, res, next) {
    res.sendFile('step1.html', { root: `public` })
  })

  app.get('/step2', function (req, res, next) {
    res.sendFile('step2.html', { root: `public` })
  })

  app.get('/step3', function (req, res, next) {
    res.sendFile('step3.html', { root: `public` })
  })

  app.get('/', function (req, res, next) {
    res.redirect('/step1')
  })

  // Handling of any other invalid routes 
  app.use(function (req, res, next) {
    return res.status(404).send()
  })
}

module.exports = routes