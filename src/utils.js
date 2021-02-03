const mime = require('mime')
const allowedExtensions = ['png', 'jpg', 'jpeg']
const maxFileSize = 5
const { v4 } = require('uuid')
const mkdirp = require('mkdirp')
const fs = require('fs')
const shortid = require('shortid')
const { sendEmail } = require('./service/mail')
var options = { format: 'Letter' }
var pdf = require('html-pdf')
var xl = require('excel4node')

let Utils = {
    getUUID: function () {
        return v4()
    },
    getUPDS: function () {
        return ["responsible_person_pan_card_photo_copy", "gifted_category_file", "authorised_person_1_photo", "authorised_person_2_photo", "authorised_person_3_photo", "authorised_person_4_photo", "student_photo", "student_passport_photocopy", "student_oci_card", "student_aadhar_card_photo_copy", "student_transfer_certificate", "student_previous_class_report_card", "student_address_proof_copy", "student_vaccination_card", "student_passport_size_coloured_photograph", "father_passport_size_coloured_photograph", "mother_passport_size_coloured_photograph", "father_aadhar_card_photocopy", "mother_aadhar_card_photocopy"]
    },
    getResolvedURL: function (path) {
        if (path) {
            path = path.replace(uploadsDir, "uploads")
        }
        return path
    },

    finalImageURL: function (image) {
        if (image) {
            image = config.apiURL + '/' + image
        }
        return image
    },

    getFormattedDate: function (date) {
        return dateFormat(date, "yyyy-mm-dd HH:MM:ss")
    },

    getFullName: function (f, l) {
        return (f + ' ' + (l || '')).trim()
    },

    sendFinalMailToStaff: async function (uuid, req, subject) {
        try {
            let html = ``
            let stUploadsDir = process.env.UPLOADS_DIR + `/${uuid}`
            let attachments = [{
                filename: `Student-${req.first_name}-${req.last_name}.pdf`,
                path: `${stUploadsDir}/student-${uuid}-generated-report.pdf`
            }, {
                filename: `Student-${req.first_name}-${req.last_name}.xlsx`,
                path: `${stUploadsDir}/student-${uuid}-generated-report.xlsx`
            }]
            for (key in req) {
                if (['uuid', 'i_confirm', 'i_confirm_2'].indexOf(key) < 0) {
                    if (validURL(req[key])) {
                        html += `<b>${getLabel(key)}</b>: <a href="${req[key]}">Click Here</a> <br />`
                        var tempExt = req[key].split('.').pop()
                        attachments.push({
                            filename: `${getLabel(key)}.${tempExt}`,
                            path: `${stUploadsDir}/student-${uuid}-${key}.${tempExt}`
                        })
                    } else {
                        html += `<b>${getLabel(key)}</b>: ${req[key]} <br />`
                    }
                }
            }
            await sendEmail({
                to: process.env.TO_EMAIL,
                subject: subject,
                html: html,
                attachments: attachments
            })
            attachments = null
        } catch (ex) {
            console.log(ex)
        }
    },

    sendMailToStaff: async function (req, subject, pLink) {
        try {
            if (pLink) {
                pLink = `${pLink}<br />`
            }
            var html = pLink || ``
            for (key in req) {
                if (['uuid', 'i_confirm', 'i_confirm_2'].indexOf(key) < 0) {
                    html += `<b>${getLabel(key)}</b>: ${req[key]} <br />`
                }
            }
            await sendEmail({
                to: process.env.TO_EMAIL,
                subject: subject,
                html: html,
                attachments: null
            })
        } catch (ex) {
            console.log(ex)
        }
    },

    genPDF: function (html, uuid) {
        return new Promise(function (resolve, reject) {
            let fileName = `student-${uuid}-generated-report.pdf`
            var stUploadsDir = process.env.UPLOADS_DIR + `/${uuid}`

            mkdirp.sync(stUploadsDir)
            pdf.create(html, options).toFile(`${stUploadsDir}/${fileName}`, function (err, res) {
                if (err) {
                    return reject(err)
                }
                return resolve()
            })
        })
    },

    genExcel: async function (req, uuid) {
        try {
            var wb = new xl.Workbook()

            var ws = wb.addWorksheet('Student Report')

            var style = wb.createStyle({
                alignment: { 
                    shrinkToFit: true,
                    wrapText: true
                },
                // font: {
                //     color: '#FF0800',
                //     size: 12,
                // },
                // numberFormat: '$#,##0.00; ($#,##0.00); -'
            })

            ws.cell(1, 1, 1, 15, true).string('Student Report')

            row = 2
            var idx = 1
            for (key in req) {
                if (['uuid', 'i_confirm', 'i_confirm_2'].indexOf(key) < 0) {
                    ws.cell(row, idx).string(getLabel(key)) //.style(style)
                    idx++
                }
            }
            row = row + 1
            idx = 1
            for (key in req) {
                if (['uuid', 'i_confirm', 'i_confirm_2'].indexOf(key) < 0) {
                    if (validURL(req[key])) {
                        ws.cell(row, idx).string(`Click Here`).link(req[key], 'Click Here', 'Click Here')
                    } else {
                        ws.cell(row, idx).string(`${req[key]}`)
                    }
                    idx++
                }
            }

            let fileName = `student-${uuid}-generated-report.xlsx`
            var stUploadsDir = process.env.UPLOADS_DIR + `/${uuid}`
            mkdirp.sync(stUploadsDir)
            var filePath = `${stUploadsDir}/${fileName}`
            wb.write(filePath)
        } catch(ex) {
            throw ex
        }
    },

    saveBase64Image: function (base64Img, uuid, name) {
        if (!base64Img || base64Img.trim() === "") {
            return
        }
        var matches = base64Img.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            decodedImg = {}

        if (!matches) {
            return
        }

        if (matches.length !== 3) {
            console.log('Invalid base64 string')
            return
        }

        decodedImg.type = matches[1]
        decodedImg.data = Buffer.from(matches[2], 'base64')
        let type = decodedImg.type
        let extension = mime.getExtension(type)
        if (allowedExtensions.indexOf(extension) < 0) {
            throw `Invalid image format. Valid image formats are ${allowedExtensions.join(',')}`
        }

        try {
            var sub = base64Img.substring(base64Img.indexOf(',') + 1)
            const imageBuffer = Buffer.from(sub)
            // console.log(sub[0], "Byte length: " + buffer.length)
            var sizeInMB = imageBuffer.length / 1e+6
            if (sizeInMB > maxFileSize) {
                throw `Max image size must be 5MB.`
            }

            let fileName = `student-${uuid}-${name}.${extension}`
            var stUploadsDir = process.env.UPLOADS_DIR + `/${uuid}`

            mkdirp.sync(stUploadsDir)

            let path = stUploadsDir + "/" + fileName
            try {
                fs.writeFileSync(path, decodedImg.data, 'utf8')
                path = process.env.STUDENT_APP_URL + "/" + path
                if (path) {
                    path = path.replace(stUploadsDir, "uploads")
                }
                path = path.replace(process.env.STUDENT_APP_URL + "/uploads", process.env.STUDENT_APP_URL + "/uploads/" + uuid)
                return path
            } catch (e) {
                console.log(e)
                return null
            }
        } catch (ex) {
            console.log(ex)
            return
        }
    },

    MESSAGES: {
        GENERIC_ERROR: `An error has occurred. Please try again later.`
    }
}

var getLabel = function (name) {
    name = name.replace(/_/g, ' ')
    return name.charAt(0).toUpperCase() + name.slice(1)
}

function validURL(str) {
    try {
        url = new URL(str)
        return true
    } catch (ex) {
        return false;
    }
}

module.exports = Utils
