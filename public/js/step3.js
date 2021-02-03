function goBack() {
    location.href = '/step1'
}

var urlParams = getParams(window.location.href)
if (urlParams && urlParams.sid && urlParams.token) {
    $.ajax({
        url: `${window.basePATH}/student3`,
        type: "post",
        data: JSON.stringify({
            uuid: urlParams.sid,
            token: urlParams.token
        }),
        contentType: 'application/json',
        success: function (resp) {
            $(".page-loader-wrapper").hide()
            if (resp.success) {
                for (key in resp.data) {
                    if(resp.data.family_status) {
                        goBack()
                    }
                    if ($(`#${key}`).length && resp.data[key]) {
                        $(`#${key}`).val(resp.data[key])
                    }
                }
                window.uuid = urlParams.sid
                window.token = urlParams.token
            } else {
                goBack()
            }
        },
        error: function (err) {
            goBack()
        }
    })
} else {
    goBack()
}

$(document).ready(function () {
    $("#save-btn").on("click", function () {
        saveStudentData('step3', function (resp) {
            if (resp.success) {
                location.href = `https://school.djitalservices.com/thank-you-2`
            } else {
                alert(`An error has occurred. Please try again.`)
            }
        }, function (msg) {
            alert(msg)
        })
    })
})