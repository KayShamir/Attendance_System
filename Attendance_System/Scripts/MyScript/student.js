$().ready(function () {
    $("#enrollButton").click(function (event) {
        event.preventDefault();
        var course_code = $('#modalCourseCode').text()
        var course_section = $('#modalSection').text()


        var formData = new FormData();
        formData.append('course_code', course_code)
        formData.append('course_section', course_section)

        $.ajax({
            url: '../student/Enroll',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: response.message
                    }).then(function () {
                        $('#courseModal').modal('hide')
                    });
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
    });
})