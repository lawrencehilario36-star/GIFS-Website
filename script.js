// Demo accounts
const accounts = {
  "admin@gfis.edu.ph": {password:"admin123", role:"admin"},
  "student@gfis.edu.ph": {password:"student123", role:"student"}
};

// HTML elements
const loginPage = document.getElementById("loginPage");
const dashboard = document.getElementById("dashboard");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const adminForm = document.getElementById("adminForm");
const titleInput = document.getElementById("titleInput");
const descInput = document.getElementById("descInput");
const categoryInput = document.getElementById("categoryInput");
const dateInput = document.getElementById("dateInput");
const announcementsDiv = document.getElementById("announcements");
const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const errorMsg = document.getElementById("error");
const clearFilterBtn = document.getElementById("clearFilterBtn");

let userRole = "";
let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
let editingId = null; // Track which announcement is being edited

// Toggle password visibility
function togglePassword(){
  const toggleIcon = document.getElementById("toggleIcon");
  if(passwordInput.type === "password"){
    passwordInput.type = "text";
    toggleIcon.classList.remove("fa-eye");
    toggleIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    toggleIcon.classList.remove("fa-eye-slash");
    toggleIcon.classList.add("fa-eye");
  }
}

// Login
function login(){
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if(!email.endsWith("@gfis.edu.ph")){
    errorMsg.innerText = "Invalid school email";
    return;
  }

  if(!accounts[email] || accounts[email].password !== password){
    errorMsg.innerText = "Incorrect email or password";
    return;
  }

  userRole = accounts[email].role;
  loginPage.style.display = "none";
  dashboard.style.display = "block";
  adminForm.style.display = userRole === "admin" ? "block" : "none";

  renderAnnouncements();
  renderCalendar();
}

// Logout
function logout(){ location.reload(); }

// Add or Update announcement
function addAnnouncement(){
  if(!dateInput.value){
    alert("Please select a date");
    return;
  }

  const dateObj = new Date(dateInput.value);
  const formattedDate = dateObj.toLocaleDateString("en-GB");

  if(editingId !== null){
    // Update existing announcement
    const index = announcements.findIndex(a => a.id === editingId);
    if(index !== -1){
      announcements[index] = {
        id: editingId,
        title: titleInput.value,
        desc: descInput.value,
        category: categoryInput.value,
        date: formattedDate
      };
    }
    editingId = null;
    document.querySelector('#adminForm button').innerText = "Post";
  } else {
    // Create new announcement
    announcements.push({
      id: Date.now(),
      title: titleInput.value,
      desc: descInput.value,
      category: categoryInput.value,
      date: formattedDate
    });
  }

  localStorage.setItem("announcements", JSON.stringify(announcements));
  renderAnnouncements();
  renderCalendar();

  titleInput.value = descInput.value = dateInput.value = "";
}

// Edit announcement
function editAnnouncement(id){
  const announcement = announcements.find(a => a.id === id);
  if(!announcement) return;

  // Populate form fields
  titleInput.value = announcement.title;
  descInput.value = announcement.desc;
  categoryInput.value = announcement.category;
  
  // Convert date from DD/MM/YYYY to YYYY-MM-DD for input
  const dateParts = announcement.date.split('/');
  const formattedForInput = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
  dateInput.value = formattedForInput;

  // Set editing mode
  editingId = id;
  document.querySelector('#adminForm button').innerText = "Update";
  
  // Scroll to form
  adminForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Cancel edit
function cancelEdit(){
  editingId = null;
  titleInput.value = descInput.value = dateInput.value = "";
  document.querySelector('#adminForm button').innerText = "Post";
}

// Render announcements (filtered or all)
function renderAnnouncements(selectedDate=null){
  announcementsDiv.innerHTML = "";
  let filtered = announcements;
  if(selectedDate) {
    filtered = announcements.filter(a => a.date === selectedDate);
    clearFilterBtn.style.display = "block";
  } else {
    clearFilterBtn.style.display = "none";
  }

  filtered.forEach(a=>{
    const card = document.createElement("div");
    card.className = "card";

    let todayTag = "";
    if(a.date === new Date().toLocaleDateString("en-GB")) todayTag = `<div class="todayTag">Today</div>`;

    card.innerHTML = `
      <span class="tag ${a.category}">${a.category}</span>
      <h4>${a.title}</h4>
      <p>${a.desc}</p>
      <small>${a.date}</small>
      ${todayTag}
      ${userRole === "admin" ? `
        <br>
        <button class="edit-btn" onclick="editAnnouncement(${a.id})">Edit</button>
        <button onclick="deleteAnnouncement(${a.id})">Delete</button>
      ` : ""}
    `;
    announcementsDiv.appendChild(card);
  });
}

// Clear filter
function clearFilter(){
  renderAnnouncements();
}

// Delete announcement
function deleteAnnouncement(id){
  announcements = announcements.filter(a => a.id !== id);
  localStorage.setItem("announcements", JSON.stringify(announcements));
  
  // If we were editing this announcement, cancel the edit
  if(editingId === id){
    cancelEdit();
  }
  
  renderAnnouncements();
  renderCalendar();
}

// Render calendar dynamically
function renderCalendar(){
  calendar.innerHTML = "";
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  monthYear.innerText = now.toLocaleString('default', {month:'long', year:'numeric'});

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  // Empty cells
  for(let i=0;i<firstDay;i++){
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  for(let day=1; day<=daysInMonth; day++){
    const dateObj = new Date(year, month, day);
    const formattedDate = dateObj.toLocaleDateString("en-GB");
    const dayDiv = document.createElement("div");
    dayDiv.className = "day";

    // Status
    if(formattedDate === new Date().toLocaleDateString("en-GB")) dayDiv.classList.add("today");
    else if(dateObj < new Date()) dayDiv.classList.add("past");
    else dayDiv.classList.add("upcoming");

    if(announcements.some(a=>a.date === formattedDate)) dayDiv.classList.add("hasEvent");

    dayDiv.innerText = day;

    // Click to filter announcements
    dayDiv.addEventListener("click", ()=> renderAnnouncements(formattedDate));

    calendar.appendChild(dayDiv);
  }
}