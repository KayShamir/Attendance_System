$().ready(function () {
    $('#record').click(function () {
        var id = $('#idInput').val()
        var formData = new FormData();
        formData.append('student_id', id);

        $.ajax({
            url: '../attendance/TimeIn',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                if (response.success) {
                    window.location.href = '../attendance/attendance'
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.message
                    });
                }
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred. Please try again later.'
                });
            }
        });
    })
})