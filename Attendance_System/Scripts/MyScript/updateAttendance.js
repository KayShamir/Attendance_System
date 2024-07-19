$().ready(function () {

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
});