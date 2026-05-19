const supabaseUrl = "https://wczoqvoymclwdgxlfbjp.supabase.co";

const supabaseKey = "sb_publishable_97X6_N5K9sPnMeRPQ7efDQ_5Hl2q-mT";

const supabaseClient = supabase.createClient(
  supabaseUrl,
  supabaseKey
);

console.log("APP RUNNING");

async function bookAppointment() {

  // BUTTON
  const button = document.getElementById("bookBtn");

  button.disabled = true;
  button.innerText = "Booking...";

  // VALUES
  const name = document.getElementById("name").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const age = document.getElementById("age").value.trim();
  const issue = document.getElementById("issue").value.trim();
  
  
 // NEXT DAY DATE

const tomorrow = new Date();

tomorrow.setDate(tomorrow.getDate() + 1);

const year = tomorrow.getFullYear();

const month = String(tomorrow.getMonth() + 1)
  .padStart(2, '0');

const day = String(tomorrow.getDate())
  .padStart(2, '0');

const appointmentDate =
  `${day}-${month}-${year}`;


// MOBILE VALIDATION

if (!/^[6-9][0-9]{9}$/.test(mobile)) {

  alert("Enter valid 10 digit mobile number");

  button.disabled = false;
  button.innerText = "Book Appointment";

  return;
}


// MAX TOKENS LIMIT

const maxTokens = 100;


// CHECK EXISTING BOOKINGS

const { data: existingBookings, error: countError } =
  await supabaseClient
    .from("appointments")
    .select("id")
    .eq("appointment_date", appointmentDate);


// ERROR CHECK

if (countError) {

  console.log(countError);

  alert("Error checking bookings");

  button.disabled = false;
  button.innerText = "Book Appointment";

  return;
}


// LIMIT CHECK

if (existingBookings.length >= maxTokens) {

  alert("Booking Full For Tomorrow");

  button.disabled = false;
  button.innerText = "Book Appointment";

  return;
}


// TOKEN NUMBER

const tokenNumber = existingBookings.length + 1;


// START TIME

let startHour = 10;
let startMinute = 0;


// EVERY TOKEN = 5 MINUTES

startMinute += (tokenNumber - 1) * 5;


// CONVERT EXTRA MINUTES

startHour += Math.floor(startMinute / 60);

startMinute = startMinute % 60;


// FORMAT TIME

const formattedHour =
startHour > 12 ? startHour - 12 : startHour;

const ampm =
startHour >= 12 ? "PM" : "AM";

const expectedTime =
`${String(formattedHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')} ${ampm}`;

 

  // INSERT DATA
  const { data, error } = await supabaseClient
    .from("appointments")
    .insert([
      {
        name: name,
        mobile: mobile,
        age: age,
        issue: issue,
        expected_time: expectedTime,
        appointment_date: appointmentDate
      }
    ])
    .select();

  // ERROR
  if (error) {

  console.log(error);

  alert(error.message);

  button.disabled = false;
  button.innerText = "Book Appointment";

  return;
}

  // TOKEN
  const newToken = tokenNumber;
  

  // SHOW POPUP
  const popup = document.getElementById("popup");

  popup.classList.add("show");

  // POPUP DATA
  document.getElementById("popupToken").innerText =
    "Token Number: " + newToken;

  document.getElementById("popupName").innerText =
    "Name: " + name;

  document.getElementById("popupMobile").innerText =
    "Mobile: " + mobile;

  document.getElementById("popupAge").innerText =
    "Age: " + age;

  document.getElementById("popupIssue").innerText =
    "Problem: " + issue;
  
  document.getElementById("popupDate").innerText =
  "Appointment Date: " + appointmentDate;

document.getElementById("popupTime").innerText =
  "Expected Time: " + expectedTime;
  
  // PDF
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("Appointment Slip", 20, 20);

  doc.setFontSize(14);
  doc.text("Token Number: " + newToken, 20, 40);
  doc.text("Name: " + name, 20, 50);
  doc.text("Mobile: " + mobile, 20, 60);
  doc.text("Age: " + age, 20, 70);
  doc.text("Problem: " + issue, 20, 80);
  doc.text("Appointment Date: " + appointmentDate, 20, 90);

doc.text("Expected Time: " + expectedTime, 20, 100);

  doc.save("Appointment-Slip.pdf");

  // RESET FORM
  document.getElementById("name").value = "";
  document.getElementById("mobile").value = "";
  document.getElementById("age").value = "";
  document.getElementById("issue").value = "";

  // BUTTON RESET
  button.disabled = false;
  button.innerText = "Book Appointment";
}

// CLOSE POPUP
function closePopup() {

  document
    .getElementById("popup")
    .classList.remove("show");

}