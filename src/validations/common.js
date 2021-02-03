var JSONValidator = require('jsonschema').Validator
var v = new JSONValidator()

module.exports = {
    validate: function (obj, reqObjectSchema) {
        validateReq(obj, reqObjectSchema)
    }
}

var validateReq = function (obj, reqObjectSchema) {
    var validationErrors = v.validate(obj, reqObjectSchema).errors
    if (validationErrors && validationErrors.length) {
        var errors = []
        validationErrors.map(function (err) {
            errors.push(err.stack)
        })
        throw errors.join(',')
    }
}