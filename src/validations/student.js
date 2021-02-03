const { validate } = require('./common')
const Utils = require('../utils')
var emailValidator = require("email-validator")

module.exports = {

    validateStep1Request: function (req) {
        var reqObjectSchema = {
            "type": "object",
            "required": true,
            "properties": {
                "enquiry_for_year": {
                    "type": "string",
                    "minLength": 1,
                    "required": true
                },
            
                "course": {
                    "type": "string",
                    "minLength": 1,
                    "required": true
                },
            
                "first_name": {
                    "minLength": 1,
                    "type": "string",
                    "required": true
                },
                
                "last_name": {
                    "minLength": 1,
                    "type": "string",
                    "required": true
                },
            
                "parent_name": {
                    "minLength": 1,
                    "type": "string",
                    "required": true
                },
            
                "email": {
                    "minLength": 1,
                    "type": "string",
                    "required": true
                },
            
                "phone": {
                    "minLength": 1,
                    "type": "string",
                    "required": true
                },
            
                "alternate_phone": {
                    "minLength": 1,
                    "type": "string",
                    "required": true
                },
            
                "dob": {
                    "minLength": 1,
                    "type": "string",
                    "required": true
                },
            
                "school": {
                    "minLength": 1,
                    "type": "string",
                    "required": true
                },
            
                "gender": {
                    "minLength": 1,
                    "type": "string",
                    "required": true
                },
            
                "address_line_1": {
                    "minLength": 1,
                    "type": "string",
                    "required": true
                },
            
                "address_line_2": {
                    "minLength": 1,
                    "type": "string",
                    "required": true
                }
            }
        }
        validate(req, reqObjectSchema)
        if (req.image && !Utils.validateBase64Image(req.image)) {
            throw `Invalid base64 image format in payload.image`
        }

        if (req.name) {
            req.name = req.name.trim()
            if (req.name.length < 3) {
                throw `Mininum length for brand name is 3`
            }
        }
        if(!emailValidator.validate(req.email)) {
            throw `Please enter valid email address.`
        }
    },

    validateBrandCreateRequest: function (req) {
        var reqObjectSchema = {
            "type": "object",
            "required": true,
            "properties": {
                "name": {
                    "type": "string",
                    "required": true
                },
                "image": {
                    "type": "string",
                    "required": true
                }
            }
        }
        validate(req, reqObjectSchema)
        if (!Utils.validateBase64Image(req.image)) {
            throw `Invalid base64 image format in payload.image`
        }
    }
}