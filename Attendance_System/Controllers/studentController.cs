using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Attendance_System.Controllers
{
    public class studentController : Controller
    {
        string connStr = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=C:\Users\kaysh\source\repos\Attendance_System\Attendance_System\App_Data\attendance.mdf;Integrated Security=True";

        public ActionResult Dashboard()
        {
            if (Session["user"] == null)
            {
                return RedirectToAction("Login", "auth");
            }

            return View();
        }

        [HttpPost]
        public ActionResult Enroll(string course_code, string course_section)
        {
            try
            {
                int course_id = 0;

                using (var db = new SqlConnection(connStr))
                {
                    db.Open();

                    string query = "SELECT COURSE_ID " +
                        " FROM COURSE " +
                        " WHERE COURSE_CODE = @course_code AND COURSE_SECTION = @course_section";

                    using (var cmd = new SqlCommand(query, db))
                    {
                        cmd.Parameters.AddWithValue("@course_code", course_code);
                        cmd.Parameters.AddWithValue("@course_section", course_section);

                        using (var reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                course_id = (int)reader["COURSE_ID"];
                                reader.Close();

                                using (var cmd1 = db.CreateCommand())
                                {
                                    cmd1.CommandType = CommandType.Text;
                                    cmd1.CommandText = "INSERT INTO STUDENT_COURSE (COURSE_ID, STUDENT_ID) " +
                                        "VALUES (@course_id, @student_id)";
                                    cmd1.Parameters.AddWithValue("@course_id", course_id);
                                    cmd1.Parameters.AddWithValue("@student_id", Session["id"]);

                                    cmd1.ExecuteNonQuery();

                                    return Json(new { success = true, message = "Waiting for Approval" });

                                }

                            }
                        }
                    }
                }
                return Json(new { success = false, message = Session["id"] + "Hello: " + course_code });

            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error: " + ex.Message });
            }

        }
    }
}