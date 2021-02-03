const Student = require('../models/student')
const { validateStep1Request } = require('../validations/student')
const { getFullName, sendMailToStaff, getUUID, sendFinalMailToStaff, saveBase64Image, getUPDS, genPDF, genExcel } = require('../utils')
const { MESSAGES } = require('../utils')
const { sendEmail } = require('../service/mail')
const fs = require('fs')

module.exports = {
    saveStudentStep1: async function (req, res) {
        var responseJSON = {
            success: false
        }
        try {
            try {
                validateStep1Request(req.body)
            } catch (ex) {
                console.log(ex)
                responseJSON['message'] = ex.toString()
                return res.status(400).send(responseJSON)
            }

            if (req.body.uuid) {
                var ret = await Student.update(req.body, req.body.uuid)
                responseJSON['sid'] = ret.uuid
            } else {
                req.body.application_date = formatDate()
                console.log(req.body)
                var ret = await Student.create(req.body)
                // responseJSON['sid'] = ret.uuid
            }
            responseJSON['success'] = true
            return res.status(200).send(responseJSON)
        } catch (ex) {
            console.log(ex)
            responseJSON['message'] = MESSAGES.GENERIC_ERROR
            return res.status(500).send(responseJSON)
        }
    },

    saveStudentStep2: async function (req, res) {
        var responseJSON = {
            success: false
        }

        if (!req.body.uuid) {
            responseJSON['message'] = `Missing required parameter: uuid`
            return res.status(400).send(responseJSON)
        }

        var student = await Student.getAllByUUID(req.body.uuid)
        if (!student) {
            responseJSON['message'] = `Record not found.`
            return res.status(404).send(responseJSON)
        }
        let uuid = req.body.uuid
        student = JSON.parse(JSON.stringify(student))
        if (!student.token) {
            req.body.token = getUUID()
        }
        await Student.update(req.body, uuid)
        student = await Student.getAllByUUID(uuid)
        student = JSON.parse(JSON.stringify(student))
        var obj = req.body
        var name = getFullName(obj.first_name, obj.last_name)
        var obj = req.body
        var emailMsg = `Dear ${obj.parent_name},<br /><br />

                    Thank you for registering for ${name} for ${obj.course} for academic year ${obj.enquiry_for_year}.<br /><br />
                    
                    Our Admission officer will contact you soon to let you know the admission process and schedule accordingly.
                    
                    Thank you and Regards`

        try {
            delete req.body.token
            await sendMailToStaff(req.body, `Pre-Admission Form - ${name}`, `Post admission form link: ${process.env.STUDENT_APP_URL}/step3?sid=${uuid}&token=${student.token}`)
            await sendEmail({
                to: obj.email,
                subject: `Your pre-admission application received at Sancta`,
                html: emailMsg,
                attachments: null
            })
        } catch (ex) {
            console.log(ex)
        }
        responseJSON['sid'] = uuid
        responseJSON['success'] = true
        return res.status(200).send(responseJSON)
    },

    saveStudentStep3: async function (req, res) {
        var responseJSON = {
            success: false
        }

        if (!req.body.uuid) {
            responseJSON['message'] = `Missing required parameter: uuid`
            return res.status(400).send(responseJSON)
        }

        var student = await Student.getByUUID(req.body.uuid)
        if (!student) {
            responseJSON['message'] = `Record not found.`
            return res.status(404).send(responseJSON)
        }

        let uuid = req.body.uuid

        for (key in req.body) {
            if (getUPDS().indexOf(key) >= 0) {
                req.body[key] = await saveBase64Image(req.body[key], uuid, key)
            }
        }
        student = JSON.parse(JSON.stringify(student))
        req.body.application_date = student.application_date
        await Student.update(req.body, uuid)
        var obj = req.body
        var emailMsg = `Dear ${obj.parent_name},<br /><br />

        The admission is confirmed for the ${getFullName(obj.first_name, obj.last_name)} for the ${obj.course} for the academic year ${obj.enquiry_for_year}.<br /><br />
        
        We will send you the Parent logins for school IRP portal shortly.<br /><br />
        
        Thank you and Regards`

        try {
            await sendEmail({
                to: obj.email,
                subject: `Your application received at Sancta`,
                html: emailMsg,
                attachments: null
            })
        } catch (ex) {
            console.log(ex)
        }

        var html = fs.readFileSync('./a1.html', 'utf8')

        for (key in req.body) {
            var replace = `{${key}}`
            var re = new RegExp(replace, "g")
            html = html.replace(re, req.body[key])
        }

        try {
            await genPDF(html, `${uuid}`)
        } catch (ex) {
            console.log(ex)
        }
        try {
            await genExcel(req.body, `${uuid}`)
        } catch (ex) {
            console.log(ex)
        }
        var obj = req.body
        var name = getFullName(obj.first_name, obj.last_name)
        await sendFinalMailToStaff(uuid, req.body, `Post-Admission Form - ${name}`)

        responseJSON['sid'] = uuid
        responseJSON['success'] = true
        return res.status(200).send(responseJSON)
    },

    getStudent: async function (req, res) {
        var responseJSON = {
            success: false
        }

        if (!req.body.uuid) {
            responseJSON['message'] = `Missing required parameter: uuid`
            return res.status(400).send(responseJSON)
        }

        var student = await Student.getByUUID(req.body.uuid)
        if (!student) {
            responseJSON['message'] = `Record not found.`
            return res.status(404).send(responseJSON)
        }
        responseJSON['success'] = true
        responseJSON['data'] = student
        return res.status(200).send(responseJSON)
    },

    getStudent3: async function (req, res) {
        var responseJSON = {
            success: false
        }

        if (!req.body.uuid) {
            responseJSON['message'] = `Missing required parameter: uuid`
            return res.status(400).send(responseJSON)
        }

        if (!req.body.token) {
            responseJSON['message'] = `Missing required parameter: token`
            return res.status(400).send(responseJSON)
        }

        var student = await Student.getByUUIDAndToken(req.body.uuid, req.body.token)
        if (!student) {
            responseJSON['message'] = `Record not found.`
            return res.status(404).send(responseJSON)
        }
        responseJSON['success'] = true
        responseJSON['data'] = student
        return res.status(200).send(responseJSON)
    }
}



function formatDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear()

    if (month.length < 2)
        month = '0' + month
    if (day.length < 2)
        day = '0' + day

    return [year, month, day].join('-')
}
