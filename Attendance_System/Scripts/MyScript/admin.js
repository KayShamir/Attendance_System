﻿$().ready(function () {
    $('#body-content').hide()
    var id;
    var schedDate;
    var schedStartTime;
    var schedEndTime;

    $(document).ready(function () {
        $("[id^=edit_]").click(function (event) {
            event.preventDefault();
            var code = $(this).data("course-code");
            $.post("../Home/CourseSearch", {
                code: code
            }, function (data) {
                if (data[0].mess == 0) {
                    $("#update_title").val(data[0].title);
                    $("#update_code").val(data[0].code);
                    $("#update_courseType").val(data[0].course_type);
                    $("#update_units").val(data[0].units);
                    $("#update_time").val(data[0].time);
                    $("#update_block").val(data[0].block);
                    $("#update_description").val(data[0].description);

                    // Clear existing schedule checkboxes
                    $("input[name='schedule']").prop('checked', false);

                    // Set schedule checkboxes based on the data
                    var schedule = data[0].schedule.split(','); // Assuming schedule is a comma-separated string
                    schedule.forEach(function (day) {
                        $("input[name='schedule'][value='" + day.trim().toLowerCase() + "']").prop('checked', true);
                    });
                } else {
                    alert("No Subject Found!");
                }
            });
        });
    });

    $('#logoutButton').click(function () {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you really want to log out?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, log out',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '../auth/login';
            }
        });
    })

    $("#update").click(function (event) {
        event.preventDefault();

        var title = $("#update_title").val();
        var code = $("#update_code").val();
        var courseType = $("#update_courseType").val();
        var units = $("#update_units").val();
        var time = $("#update_time").val();
        var block = $("#update_block").val();
        var description = $("#update_description").val();

        // Collect the schedule values
        var schedule = [];
        $("input[name='schedule']:checked").each(function () {
            schedule.push($(this).val());
        });

        $.post("../Home/CourseUpdate", {
            title: title,
            code: code,
            courseType: courseType,
            units: units,
            time: time,
            block: block,
            description: description,
            schedule: schedule.join(',') // Join array to a comma-separated string
        }, function (data) {
            if (data[0].mess == 0) {
                alert("The data was successfully updated");
                location.reload();
            }
        });
    });



    $("[id^=delete_]").click(function (event) {
        event.preventDefault();
        var code = $(this).data("course-code");

        $.post("../Home/deleteCourse", {
            code: code

        }, function (data) {
            if (data[0].mess == 0) {
                alert('Data was successfully removed');
                location.reload();
            }
        });
    });

    $(".denyButton").click(function (event) {
        event.preventDefault();

        var formData = new FormData();
        formData.append('student_id', $(this).data('student'))
        formData.append('course_code', $(this).data('code'))
        formData.append('course_section', $(this).data('section'))

        $.ajax({
            url: '../Home/Unenroll',
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
                        window.location.href = '../Home/Admin';
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

    $(".approveButton").click(function (event) {
        event.preventDefault();

        var formData = new FormData();
        formData.append('student_id', $(this).data('student'))
        formData.append('course_code', $(this).data('code'))
        formData.append('course_section', $(this).data('section'))
        formData.append('contact', $(this).data('contact'))

        console.log($(this).data('contact'))

        $.ajax({
            url: '../Home/Enroll',
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
                        window.location.href = '../Home/Admin';
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

    $('.card-dashboard').click(function () {
        $('#selected-date').off()
        $('#note').off()
        $('#note').hide()

        id = $(this).data('id')
        var sched = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        var selectedSched = $(this).data('sched').split(', ')
        var selectedTime = $(this).data('time').split(', ')
        var indexList = []
        indexList = sched.map((day, index) => {
            return selectedSched.includes(day) ? null : index;
        }).filter(index => index !== null);


        $('#dashboard-content').hide()

        $('#selected-course').text($(this).data('code'))
        $('#selected-section').text($(this).data('section'))

        let today = new Date();
        let todayDate = getNextValidDate(today, indexList);
        let day = todayDate.getDay()
        $('#selected-date').val(formatDate(todayDate));
        schedDate = formatDate(todayDate)

        var time = selectedSched.indexOf(sched[day])
        schedStartTime = subtractTime(selectedTime[time].split(' - ')[0])
        schedEndTime = selectedTime[time].split(' - ')[1]
        $('#selected-sched').text(`(${days[day]}, ${selectedTime[time]})`)

        $('#body-content').show()

        let previousDate = formatDate(todayDate);

        getAttendanceList($(this).data('id'), previousDate)
            .then(response => {
                displayAttendance(response);
            })
            .catch(error => {
                console.error(error);
            });

        $('#selected-date').on('input', function () {
            $('#note').hide()

            let date = new Date(this.value);
            let day = date.getDay();

            if (!indexList.includes(day)) {
                console.log('dsdasda')
                previousDate = this.value;
                var time = selectedSched.indexOf(sched[day])
                schedStartTime = subtractTime(selectedTime[time].split(' - ')[0])
                schedEndTime = selectedTime[time].split(' - ')[1]

                $('#selected-sched').text(`(${days[day]}, ${selectedTime[time]})`)

                schedDate = previousDate

                getAttendanceList(id, previousDate)
                    .then(response => {
                        displayAttendance(response);
                    })
                    .catch(error => {
                        // Handle the error here
                        console.error(error);
                    });
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: 'Alert',
                    text: 'No Schedule.',
                }).then(() => {
                    $('#selected-date').val(previousDate);
                });
            }

       
        });

        $('#note').on('click', function () {

        })
    })

    $('#back').click(function () {
        $('#dashboard-content').show()
        $('#body-content').hide()
    })

    function formatDate(date) {
        let month = ('0' + (date.getMonth() + 1)).slice(-2);
        let day = ('0' + date.getDate()).slice(-2);
        let year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }

    function isValidDay(date, sched) {
        let day = date.getDay();
        return !sched.includes(day)
    }

    function getNextValidDate(date, sched) {
        while (!isValidDay(date, sched)) {
            date.setDate(date.getDate() - 1);
        }
        return date;
    }

    function getAttendanceList(id, date) {
        return new Promise((resolve, reject) => {
            var formData = new FormData();
            formData.append('course_id', id);
            formData.append('date', date);

            $.ajax({
                url: '../Home/Attendance',
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function (response) {
                    resolve(response);
                },
                error: function (xhr, status, error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'An error occurred. Please try again later.'
                    });
                    reject(error);
                }
            });
        });
    }

    function displayAttendance(data) {
        var tbody = $('#attendanceTable tbody');
        tbody.empty();

        if (data.length > 0) {
            data.forEach(item => {
                let studentId = item["student_id"] ? item["student_id"] : '-';
                let lastName = item["student_lastname"] ? item["student_lastname"] : '-';
                let firstName = item["student_firstname"] ? item["student_firstname"] : '-';
                let middleNameInitial = item["student_midname"] ? item["student_midname"].charAt(0).toUpperCase() + '.' : '-';
                let attendanceTimeIn = item["time_in"] ? item["attendance_time_in"] : '-';
                let attendanceStatus = item["remarks"] ? item["attendance_status"] : '-';
                let supportingDocs = item["docs"] ? item["attendance_supporting_docs"] : '-';

                var row = `
                <tr style="font-size: 12px; font-weight: normal; text-align: center;">
                    <td>${studentId}</td>
                    <td>${lastName}</td>
                    <td>${firstName}</td>
                    <td>${middleNameInitial}</td>
                    <td>${attendanceTimeIn}</td>
                    <td>${attendanceStatus}</td>
                    <td>${supportingDocs}</td>
                </tr>
                `;
                tbody.append(row);
            });
        }
        else {
            const strToday = getCurrentLocalDateTime();
            const strStartSched = `${schedDate}T${schedStartTime}:00`
            const strEndSched = `${schedDate}T${schedEndTime}:00`

            var today = new Date(strToday);
            var startSched = new Date(strStartSched);
            var endSched = new Date(strEndSched);

            if (startSched < today && schedDate == strToday.split('T')[0]) {
                $('#note').show()
            }
            
        }
    }

    function getCurrentLocalDateTime() {
        const now = new Date();

        // Extract components
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        // Format as YYYY-MM-DDTHH:MM:SS
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    function subtractTime(timeString) {
        // Split time string into hours and minutes
        const [hours, minutes] = timeString.split(':').map(Number);

        // Create a Date object with the given time
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(0);

        // Subtract the specified number of hours
        date.setHours(date.getHours() - 2);

        // Format the result back to HH:MM
        const newHours = String(date.getHours()).padStart(2, '0');
        const newMinutes = String(date.getMinutes()).padStart(2, '0');

        return `${newHours}:${newMinutes}`;
    }
});