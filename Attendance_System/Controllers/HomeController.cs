using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Data;
using System.Data.SqlClient;
using System.IO;

namespace Attendance.Controllers
{
    public class HomeController : Controller
    {
        string connStr = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=C:\Users\kaysh\source\repos\Attendance_System\Attendance_System\App_Data\attendance.mdf;Integrated Security=True";
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult Admin()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Admin(FormCollection collection, HttpPostedFileBase img)
        {
            if (img == null || img.ContentLength <= 0)
            {
                Response.Write("<script>alert('Please upload an image.')</script>");
                return View();
            }
            string imag = Path.GetFileName(img.FileName);
            string logpath = "c:\\attendance";  // Make sure this directory exists on your server
            string filepath = Path.Combine(logpath, imag);
            img.SaveAs(filepath);

            var code = collection["code"];
            var title = collection["title"];
            var description = collection["description"];
            var course_type = collection["courseType"];
            var units = collection["units"];
            var schedule = collection["schedule"];
            var time = collection["time"];
            var block = collection["block"];

            using (var db = new SqlConnection(connStr))
            {
                db.Open();
                using (var cmd = db.CreateCommand())
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandText = "INSERT INTO COURSE (COURSE_CODE, COURSE_TITLE, COURSE_DESCRIPTION, COURSE_TYPE, COURSE_UNITS, COURSE_SCHED, COURSE_TIME, COURSE_SECTION, COURSE_IMAGE_URL) " +
                                      "VALUES (@code, @title, @description, @course_type, @units, @schedule, @time, @block, @file)";
                    cmd.Parameters.AddWithValue("@code", code);
                    cmd.Parameters.AddWithValue("@title", title);
                    cmd.Parameters.AddWithValue("@description", description);
                    cmd.Parameters.AddWithValue("@course_type", course_type);
                    cmd.Parameters.AddWithValue("@units", units);
                    cmd.Parameters.AddWithValue("@schedule", schedule);
                    cmd.Parameters.AddWithValue("@time", time);
                    cmd.Parameters.AddWithValue("@block", block);
                    cmd.Parameters.AddWithValue("@file", imag);

                    int rowsAffected = cmd.ExecuteNonQuery();
                    if (rowsAffected > 0)
                    {
                        TempData["SuccessMessage"] = "Successfully Created.";
                        return RedirectToAction("Admin"); // Redirect to avoid form resubmission
                    }
                    else
                    {
                        // Insert failed
                        return RedirectToAction("Error", "Admin"); // Redirect to an error page or handle accordingly
                    }
                }
            }
        }

        private bool CheckIfCodeExists(string code)
        {
            using (var db = new SqlConnection(connStr))
            {
                db.Open();
                using (var cmd = db.CreateCommand())
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandText = "SELECT COUNT(*) FROM COURSE WHERE COURSE_CODE = @code"; // Correct table and column name
                    cmd.Parameters.AddWithValue("@code", code);
                    int count = (int)cmd.ExecuteScalar();
                    return count > 0;
                }
            }
        }

        [HttpGet]
        public FileResult Image(string filename)
        {
            var folder = "c:\\attendance";
            var filepath = Path.Combine(folder, filename);
            if (!System.IO.File.Exists(filepath))
            {
                // Return a default image or handle the error
            }
            var mime = System.Web.MimeMapping.GetMimeMapping(Path.GetFileName(filepath));
            return new FilePathResult(filepath, mime);
        }


        // UPDATE
        public ActionResult CourseUpdate()
        {
            var data = new List<object>();
            var code = Request["code"];
            var title = Request["title"];
            var course_type = Request["courseType"];
            var units = Request["units"];
            var time = Request["time"];
            var block_section = Request["block"];
            var description = Request["description"];
            var schedule = Request["schedule"] ?? ""; // Default to an empty string if schedule is null

            using (var db = new SqlConnection(connStr))
            {
                db.Open();
                using (var cmd = db.CreateCommand())
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandText = "UPDATE COURSE SET" +
                                      " COURSE_TITLE = @title, " +
                                      " COURSE_TYPE = @course_type, " +
                                      " COURSE_UNITS = @units, " +
                                      " COURSE_TIME = @time, " +
                                      " COURSE__SECTION = @block_section, " +
                                      " COURSE_DESCRIPTION = @description, " +
                                      " COURSE_SCHED = @schedule" +
                                      " WHERE COURSE_CODE ='" + code + "'";
                    cmd.Parameters.AddWithValue("@title", title);
                    cmd.Parameters.AddWithValue("@course_type", course_type);
                    cmd.Parameters.AddWithValue("@units", units);
                    cmd.Parameters.AddWithValue("@time", time);
                    cmd.Parameters.AddWithValue("@block_section", block_section);
                    cmd.Parameters.AddWithValue("@description", description);
                    cmd.Parameters.AddWithValue("@schedule", schedule);

                    var ctr = cmd.ExecuteNonQuery();
                    if (ctr > 0)
                    {
                        data.Add(new
                        {
                            mess = 0
                        });
                    }
                }
            }
            return Json(data, JsonRequestBehavior.AllowGet);
        }




        public ActionResult CourseSearch()
        {
            var data = new List<object>();
            var code = Request["code"];

            using (var db = new SqlConnection(connStr))
            {
                db.Open();
                using (var cmd = db.CreateCommand())
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandText = $"SELECT * FROM COURSE"
                                    + " WHERE COURSE_CODE='" + code + "'";
                    SqlDataReader reader = cmd.ExecuteReader();
                    if (reader.Read())
                    {
                        data.Add(new
                        {
                            mess = 0,
                            code = reader["course_code"].ToString(),
                            title = reader["course_title"].ToString(),
                            course_type = reader["course_type"].ToString(),
                            units = reader["course_units"].ToString(),
                            schedule = reader["course_sched"].ToString(),
                            time = reader["course_time"].ToString(),
                            block = reader["course_section"].ToString(),
                            description = reader["course_description"].ToString()
                        });
                    }
                    else
                    {
                        data.Add(new
                        {
                            mess = 1
                        });
                    }
                }
            }
            return Json(data, JsonRequestBehavior.AllowGet);
        }

        // DELETE
        public ActionResult deleteCourse()
        {
            var data = new List<object>();
            var code = Request["code"];

            using (var db = new SqlConnection(connStr))
            {
                db.Open();
                using (var cmd = db.CreateCommand())
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandText = $"DELETE FROM COURSE WHERE COURSE_CODE='" + code + "'";
                    var ctr = cmd.ExecuteNonQuery();
                    if (ctr > 0)
                    {
                        data.Add(new
                        {
                            mess = 0
                        });
                    }

                }

            }
            return Json(data, JsonRequestBehavior.AllowGet);

        }

    }
}