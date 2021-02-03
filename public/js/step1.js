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

var urlParams = getParams(window.location.href)
if (urlParams && urlParams.sid) {
    // $.ajax({
    //     url: `${window.basePATH}/student`,
    //     type: "post",
    //     data: JSON.stringify({
    //         uuid: urlParams.sid
    //     }),
    //     contentType: 'application/json',
    //     success: function (resp) {
    //         if (resp.success) {
    //             for (key in resp.data) {
    //                 if ($(`#${key}`).length) {
    //                     $(`#${key}`).val(resp.data[key])
    //                 }
    //             }
    //             window.uuid = urlParams.sid
    //         } else {
    //             location.href = '/step1'
    //         }
    //         $(".page-loader-wrapper").hide()
    //     },
    //     error: function (err) {
    //         $(".page-loader-wrapper").hide()
            location.href = '/step1'
    //     }
    // })
}

$(".page-loader-wrapper").hide()

$(document).ready(function () {
    $("#save-btn").on("click", function () {
        saveStudentData('step1', function (resp) {
            if (resp.success) {
                location.href = `https://school.djitalservices.com/thank-you`
            } else {
                alert(`An error has occurred. Please try again.`)
            }
        }, function (msg) {
            alert(msg)
        })
    })
})