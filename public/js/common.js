window.basePATH = ''
var getParams = function (url) {
    var params = {};
    var parser = document.createElement('a')
    parser.href = url
    var query = parser.search.substring(1)
    var vars = query.split('&')
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=')
        params[pair[0]] = decodeURIComponent(pair[1])
    }
    return params
}

var getLabel = function (name) {
    name = name.replace(/_/g, ' ')
    return name.charAt(0).toUpperCase() + name.slice(1)
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}


var fileExtension = ['jpeg', 'jpg', 'png']
window.imgs = {}
$("#main-form input[type=file]").change(function () {
    var fileInput = $(this)[0]
    if ($.inArray($(this).val().split('.').pop().toLowerCase(), fileExtension) == -1) {
        delete window.imgs[fileInput.id]
        $(this).val('')
        alert("Only formats are allowed : " + fileExtension.join(', '))
    } else {
        var reader = new FileReader()
        reader.readAsDataURL(fileInput.files[0])

        reader.onload = function () {
            window.imgs[fileInput.id] = reader.result
        }
        reader.onerror = function (error) {
            console.log('Error: ', error)
        }
    }
})

var saveStudentData = function (path, onSuccess, onError) {
    var payload = {
        uuid: window.uuid
    }
    var inps = $("#main-form input[type=text]")

    var optional = ['mother_organisation',
        'father_organisation',
        'mother_designation',
        'father_designation',
        'mother_specialisation', 'father_specialisation', 'mother_annual_income', 'father_annual_income',
        'sibling_1_name', 'sibling_1_age', 'sibling_1_school', 'sibling_1_class',
        'sibling_2_name', 'sibling_2_age', 'sibling_2_school', 'sibling_2_class',

        'authorised_person_3_name', 'authorised_person_3_relationship', 'authorised_person_3_photo',
        'authorised_person_4_name', 'authorised_person_4_relationship', 'authorised_person_4_photo',

        'student_passport_num', 'student_passport_date_of_issue', 'student_passport_date_of_expiry',
        'student_passport_photocopy', 'student_oci_card', 'student_aadhar_card_num', 'student_aadhar_card_photo_copy', 'student_transfer_certificate',
        'student_previous_class_report_card', 'student_address_proof_copy', 'student_vaccination_card', 'father_aadhar_card',
        'father_aadhar_card_photocopy', 'mother_aadhar_card_num', 'mother_aadhar_card_photocopy', 'responsible_person_name', 'responsible_person_pan_card',
        'responsible_person_pan_card_photo_copy',
        'personal_identification_marks_1', 'personal_identification_marks_2', 'permanent_habitation',
        'gifted_category_file'
    ]

    var errors = []

    var files = $("#main-form input[type=file]")
    files.each(function (i, file) {
        if ($.inArray($(this).val().split('.').pop().toLowerCase(), fileExtension) == -1) {
            if (optional.indexOf(file.id) < 0) {
                // alert("Only formats are allowed : " + fileExtension.join(', '))
                errors.push(`<li>Please upload mandatory document: ${getLabel(file.id)}.</li>`)
            }
        }
    })

    if($("#family_status").length) {
        if($("#family_status").val().trim() === '') {
            errors.push(`<li>Please enter Family status.</li>`)
        } else {
            payload['family_status'] = $("#family_status").val().trim()
        }
    }

    var regEx = /\d{10}/
    inps.each(function (i, item) {
        var val = $(item).val().trim()
        if (optional.indexOf(item.id) < 0) {
            if (val === '' && ['email', 'phone', 'alternate_phone', 'father_email', 'father_phone', 'mother_email', 'mother_phone'].indexOf(item.id) < 0) {
                errors.push(`<li>${getLabel(item.id)} is mandatory field.</li>`)
            }
            switch (item.id) {
                case 'email':
                    if (!validateEmail(val)) {
                        errors.push(`<li>Please enter valid email address.</li>`)
                    }
                    break
                case 'phone':
                    if (val.length != 10) {
                        errors.push(`<li>Please enter 10 digit phone number.</li>`)
                    } else if (!regEx.test(Number(val))) {
                        errors.push(`<li>Please enter 10 digit valid phone number.</li>`)
                    }
                    break

                case 'father_email':
                    if (!validateEmail(val)) {
                        errors.push(`<li>Please enter valid Father's email address.</li>`)
                    }
                    break
                case 'father_phone':
                    if (val.length != 10) {
                        errors.push(`<li>Please enter 10 digit Father's phone number.</li>`)
                    } else if (!regEx.test(Number(val))) {
                        errors.push(`<li>Please enter 10 digit Father's valid phone number.</li>`)
                    }
                    break

                case 'mother_email':
                    if (!validateEmail(val)) {
                        errors.push(`<li>Please enter valid Mother's email address.</li>`)
                    }
                    break
                case 'mother_phone':
                    if (val.length != 10) {
                        errors.push(`<li>Please enter 10 digit Mother's phone number.</li>`)
                    } else if (!regEx.test(Number(val))) {
                        errors.push(`<li>Please enter 10 digit Mother's valid phone number.</li>`)
                    }
                    break
                case 'alternate_phone':
                    if (val.length != 10) {
                        errors.push(`<li>Please enter 10 digit alternate phone number.</li>`)
                    } else if (!regEx.test(Number(val))) {
                        errors.push(`<li>Please enter 10 digit valid alternate phone number.</li>`)
                    }
                    break
            }
        }
    })
    if ($("#dob").val() === '') {
        errors.push(`<li>Please select DOB.</li>`)
    } else {
        date = new Date($("#dob").val())
        var yesterday = new Date(date.getTime())
        yesterday.setDate(date.getDate() + 1)
        if (yesterday > new Date()) {
            errors.push(`<li>Please select valid DOB.</li>`)
        }
    }
    if ($("#i_confirm").val() === 'No') {
        errors.push(`<li>Please confirm form submission by selecting 'Yes'</li>`)
    }

    if ($("#i_confirm_2").val() === 'No') {
        errors.push(`<li>Please confirm form submission by selecting 'Yes'</li>`)
    }

    if (errors.length) {
        $("#validation-errors").html(errors.join(''))
        $("#validation-errors").show()
        window.scrollTo(0, 0)
        return
    }
    $("#validation-errors").html('')
    $("#validation-errors").hide()

    inps.each(function (i, item) {
        payload[item.id] = $(item).val()
    })
    var sels = $("#main-form select")
    var dates = $("#main-form input[type=date]")
    dates.each(function (i, item) {
        payload[item.id] = $(item).val()
    })
    sels.each(function (i, item) {
        payload[item.id] = $(item).val()
    })

    payload = {
        ...payload,
        ...window.imgs
    }
    // console.log(payload, Object.keys(payload))
    $(".page-loader-wrapper").show()
    $.ajax({
        url: `${window.basePATH}/${path}`,
        type: "post",
        data: JSON.stringify(payload),
        contentType: 'application/json',
        success: function (resp) {
            $(".page-loader-wrapper").hide()
            onSuccess(resp)
        },
        error: function (err) {
            $(".page-loader-wrapper").hide()
            onError(err.responseJSON.message)
        }
    })
}