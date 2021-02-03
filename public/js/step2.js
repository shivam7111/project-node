function goBack() {
    location.href = '/step1'
}

var urlParams = getParams(window.location.href)
if (urlParams && urlParams.sid) {
    $.ajax({
        url: `${window.basePATH}/student`,
        type: "post",
        data: JSON.stringify({
            uuid: urlParams.sid
        }),
        contentType: 'application/json',
        success: function (resp) {
            $(".page-loader-wrapper").hide()
            if (resp.success) {
                for (key in resp.data) {
                    if(resp.data.mother_tongue) {
                        goBack()
                    }
                    if ($(`#${key}`).length && resp.data[key]) {
                        $(`#${key}`).val(resp.data[key])
                    }
                }
                window.uuid = urlParams.sid
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
        saveStudentData('step2', function (resp) {
            if (resp.success) {
                location.href = `https://school.djitalservices.com/thank-you-1`
            } else {
                alert(`An error has occurred. Please try again.`)
            }
        }, function (msg) {
            alert(msg)
        })
    })
})