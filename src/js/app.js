const { createClient } = supabase;
const supabaseProjectUrl = "https://iuiwdjtmdeempcqxeuhf.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1aXdkanRtZGVlbXBjcXhldWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTY1MDcsImV4cCI6MjA2MDMzMjUwN30.XfSmnKA8wbsXIA1qkfYaRkzxtEdudIDNYbSJu-M5Zag";
export const supaClient = createClient(supabaseProjectUrl, supabaseKey);
const studentId = sessionStorage.getItem("studentId");
const logOutButton = document.querySelector(".log-out");
logOutButton.addEventListener("click", logOut);
// Option 1: Using CDN
//////////////////////////////////////////////////////
// console.log(window.location.href === "index.html");
// console.log(window.location.href.includes("index.html"));
function isUserLoggedIn() {
  if (!studentId && !window.location.href.includes("index.html")) {
    alert("sign in first");
    window.location.href = "index.html"; // Redirect to the sign-in page
    return;
  }
}
isUserLoggedIn();
export async function getUserName(studentId) {
  const { data, error } = await supaClient
    .from("student")
    .select("student_name")
    .eq("student_id", studentId);
  if (error) {
    console.error("Error fetching student name:", error);
    return null;
  }
  if (data && data.length > 0) {
    // const name = data[0].student_name;
    // userName.textContent = name;
    return data[0].student_name;
  }
}
function logOut() {
  const confirmation = confirm("Are you sure you want to log out!");
  if (!confirmation) return;
  sessionStorage.setItem("studentId", null);
  sessionStorage.setItem("courseId", null);
  window.location.href = "index.html";
}

// async function test() {
//   const { data, error } = await supaClient
//     .from("enrollment")
//     .select("*")
//     .eq("student_id", studentId);
//   if (error) {
//     console.error("Error fetching student:", error);
//     return null;
//   }
//   if (data) {
//     data.forEach(async (element) => {
//       const courseId = element.course_id;
//       const { data, error } = await supaClient
//         .from("session")
//         .select("*")
//         .eq("course_id", courseId);
//       if (error) {
//         console.error("Error fetching course:", error);
//         return null;
//       }
//       if (data) {
//         console.log("Course data:", data);
//       }
//     });
//   }
//   return data;
// }
// test();
