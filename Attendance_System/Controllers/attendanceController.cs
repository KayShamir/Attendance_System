using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Attendance_System.Controllers
{

    public class attendanceController : Controller
    {
        string connStr = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=C:\Users\kaysh\source\repos\Attendance_System\Attendance_System\App_Data\attendance.mdf;Integrated Security=True";

        public ActionResult attendance()
        {
            if (Session["attendance"] == "start")
            {
                return View();
            }

            return RedirectToAction("Admin", "Home");
        }

        [HttpPost]
        public ActionResult TimeIn(string student_id)
        {
            try
            {

                using (var db = new SqlConnection(connStr))
                {
                    db.Open();

                    string query = @"
                                    INSERT INTO attendance (student_id, course_id, attendance_date)
                                    SELECT student_id, course_id, GETDATE() AS attendance_date
                                    FROM student_course
                                    WHERE course_id = @course_id;
                                ";

                    using (var cmd = new SqlCommand(query, db))
                    {
                        cmd.Parameters.AddWithValue("@course_id", course_id);

                        cmd.ExecuteNonQuery();
                        Session["attendance"] = "start";
                        Session["course_id"] = course_id;
                    }
                }
                return Json(new { success = true });

            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message });
            }

        }
    }
}