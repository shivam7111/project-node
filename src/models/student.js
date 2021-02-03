const { sequelize, Sequelize } = require('../database/db_client')
const { getUUID, sendMailToStaff, getUPDS } = require('../utils')
const { sendEmail } = require('./../service/mail')

var initial = {
    id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
    },

    uuid: {
        type: Sequelize.STRING
    },

    enquiry_for_year: {
        type: Sequelize.STRING
    },

    course: {
        type: Sequelize.STRING
    },

    first_name: {
        type: Sequelize.STRING
    },

    last_name: {
        type: Sequelize.STRING
    },

    parent_name: {
        type: Sequelize.STRING
    },

    email: {
        type: Sequelize.STRING
    },

    phone: {
        type: Sequelize.STRING
    },

    alternate_phone: {
        type: Sequelize.STRING
    },

    dob: {
        type: Sequelize.STRING
    },

    school: {
        type: Sequelize.STRING
    },

    gender: {
        type: Sequelize.STRING
    },

    address_line_1: {
        type: Sequelize.STRING
    },

    address_line_2: {
        type: Sequelize.STRING
    },

    mother_tongue: {
        type: Sequelize.STRING
    },


    language_known: {
        type: Sequelize.STRING
    },

    nationality: {
        type: Sequelize.STRING
    },
    current_residential_address: {
        type: Sequelize.STRING
    },

    permanent_address: {
        type: Sequelize.STRING
    },
    current_school_address: {
        type: Sequelize.STRING
    },

    reason_for_leaving: {
        type: Sequelize.STRING
    },
    other_curriculum: {
        type: Sequelize.STRING
    },

    any_medical_condition: {
        type: Sequelize.STRING
    },

    allergies_to_food: {
        type: Sequelize.STRING
    },
    application_date: {
        type: Sequelize.TEXT
    }

}

var temp = ["token", "current_school", "mother_email", "child_parent_name", "learning_difficulty", "mother_name", "father_phone", "email", "mother_address", "mother_organisation", "mother_designation", "mother_specialisation", "mother_annual_income", "father_name", "father_email", "father_address", "father_organisation", "father_designation", "father_specialisation", "father_annual_income", "top_3_qualities", "curriculum", "mother_professional_status", "mother_phone", "father_professional_status", "school_transport", "hear_about_us",
    "student_full_name", "religion", "emergency_contact", "guardian_first_name", "guardian_last_name", "guardian_relationship", "guardian_address", "guardian_phone", "guardian_email", "extra_curricular_highlights", "special_interests", "sibling_1_name", "sibling_1_school", "sibling_1_class", "sibling_2_name", "sibling_2_class", "blood_group", "immunisation_history", "ongoing_medication", "chronic_illness", "allergies", "authorised_person_1_name", "authorised_person_3_name", "family_status", "authorised_person_1_relationship", "authorised_person_2_relationship", "authorised_person_3_relationship", "authorised_person_4_name", "authorised_person_4_relationship", "student_passport_date_of_issue", "student_passport_date_of_expiry", "student_aadhar_card_num", "father_aadhar_card", "mother_aadhar_card_num", "responsible_person_name", "responsible_person_pan_card", "myfile", "fname", "declaration_person_name", "declaration_person_relation", "declaration_person_form_sign_date", "caste", "availability_of_aadhaar", "bio_metric_updated", "personal_identification_marks_1", "personal_identification_marks_2", "permanent_district", "permanent_mandal", "gp_revenue", "permanent_habitation", "present_district", "present_mandal", "enquiry_for_year", "course", "gender", "curriculum", "mother_professional_status", "father_professional_status", "school_transport", "hear_about_us", "guardian_title"
]

temp.map(function (it) {
    initial[it] = {
        type: Sequelize.TEXT
    }
})

initial['created_at'] = {
    type: 'TIMESTAMP',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    allowNull: false
}

initial['updated_at'] = {
    type: 'TIMESTAMP',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    allowNull: false
}

var Student = sequelize.define('Student', initial, {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    tableName: 'student',
    // indexes: [{
    //     unique: true,
    //     fields: []
    // }]
})

// sequelize.sync({ force: true })

var getByUUID = async function (uuid) {
    var ex = getUPDS()
    ex.push('token')
    return await Student.findOne({
        attributes: { exclude: ex },
        where: {
            uuid
        }
    })
}

var getByUUIDAndToken = async function (uuid, token) {
    var ex = getUPDS()
    ex.push('token')
    return await Student.findOne({
        attributes: { exclude: ex },
        where: {
            uuid,
            token
        }
    })
}

var getAllByUUID = async function (uuid) {
    return await Student.findOne({
        where: {
            uuid
        }
    })
}

var create = async function (req) {
    try {
        req.uuid = getUUID()
        var ret = await Student.create(req)
        try {
            var name = req.first_name + ' ' + req.last_name
            await sendMailToStaff(req, `New Student Enquiry - ${name}`, `Pre admission form link: ${process.env.STUDENT_APP_URL}/step2?sid=${req.uuid}`)
            await sendEmail({
                to: req.email,
                attachments: null,
                subject: `Your application received at Sancta `,
                html: `Dear Parent,<br />

                <br />We are glad to offer provisional admission to your child, ${name} for ${req.course} for the academic session of ${req.enquiry_for_year}.<br />
                                
                <br />PFA the list of documents for your ready reference, to be submitted along with the form. We request you to keep the documents ready before you start filling in the form. Please note that the size of uploaded file should be less than 5 MB.<br />
                
                <br />We request you to submit the same by 19-12-2020. Please note that admission will be confirmed only after receiving the form and all the documents mentioned in the form. Failure to submit the same by above mentioned date will result in cancellation of provisional admission with immediate effect.<br />
                
                <br /><br />Kindly contact the Parent Relations Officers on the following numbers 9123456789 / 9123456789 for any further queries.`
            })
        } catch (ex) {
            console.log(ex)
        }
        return ret
    } catch (ex) {
        console.log(ex)
        throw MESSAGES.GENERIC_ERROR
    }
}

var update = async function (req, uuid) {
    try {
        delete req.uuid
        return await Student.update(req, {
            where: {
                uuid
            }
        })
    } catch (ex) {
        console.log(ex)
        throw MESSAGES.GENERIC_ERROR
    }
}

module.exports = {
    create,
    update,
    getByUUID,
    getByUUIDAndToken,
    getAllByUUID,
    Student
}