var nodemailer = require('nodemailer')
let mail = {
    email: process.env.EMAIL_ADDRESS,
    password: process.env.EMAIL_PASSWORD
}
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: mail.email,
        pass: mail.password
    }
})

var send = function (objReq) {
    let mailOptions = {
        from: mail.email
    }
    return new Promise(function (resolve, reject) {
        mailOptions.subject = objReq.subject
        mailOptions.to = objReq.to
        mailOptions.html = objReq.html
        // console.log(mailOptions)
        if (objReq.attachments) {
            mailOptions.attachments = objReq.attachments
        }
        // `<br /><br /><a href="${getAppURL()}">Sancta</a> Team`

        // console.log(mailOptions)
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error)
                reject(error)
            } else {
                console.log('Email sent: ' + info.response)
                resolve()
            }
        })
    })
}

var sendEmail = async function (objReq) {
    await send(objReq)
}

module.exports = {
    sendEmail
}