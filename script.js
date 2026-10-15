// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const attendeeList = document.getElementById("attendeeList");
const emptyList = document.getElementById("emptyList");

// Attendance goal
const maxCount = 50;

// Team info: the count element and the display name for each team value
const teams = {
  water: { name: "Team Water Wise", countEl: document.getElementById("waterCount") },
  zero: { name: "Team Net Zero", countEl: document.getElementById("zeroCount") },
  power: { name: "Team Renewables", countEl: document.getElementById("powerCount") },
};

// Load saved data from localStorage, or start fresh
let count = parseInt(localStorage.getItem("count")) || 0;
let teamCounts = JSON.parse(localStorage.getItem("teamCounts")) || { water: 0, zero: 0, power: 0 };
let attendees = JSON.parse(localStorage.getItem("attendees")) || [];

// Save everything to localStorage
function saveProgress() {
  localStorage.setItem("count", count);
  localStorage.setItem("teamCounts", JSON.stringify(teamCounts));
  localStorage.setItem("attendees", JSON.stringify(attendees));
}

// Update the total count and the progress bar
function updateAttendance() {
  attendeeCount.textContent = count;
  const percentage = Math.min(Math.round((count / maxCount) * 100), 100);
  progressBar.style.width = percentage + "%";
}

// Update each team's counter
function updateTeamCounts() {
  for (const team in teams) {
    teams[team].countEl.textContent = teamCounts[team];
  }
}

// Add one attendee to the list on the page
function addToList(attendee) {
  const item = document.createElement("li");
  item.className = "attendee-item";

  const nameSpan = document.createElement("span");
  nameSpan.className = "attendee-name";
  nameSpan.textContent = attendee.name;

  const teamSpan = document.createElement("span");
  teamSpan.className = "attendee-team " + attendee.team;
  teamSpan.textContent = teams[attendee.team].name;

  item.appendChild(nameSpan);
  item.appendChild(teamSpan);
  attendeeList.prepend(item); // newest at the top
  emptyList.style.display = "none";
}

// Show a message in the greeting box
function showMessage(message, isCelebration) {
  greeting.textContent = message;
  greeting.className = isCelebration ? "success-message celebration-message" : "success-message";
  greeting.style.display = "block";
}

// When the goal is reached, find the team with the most attendees and celebrate
function checkForCelebration() {
  if (count < maxCount) return;

  const highest = Math.max(teamCounts.water, teamCounts.zero, teamCounts.power);
  const winners = Object.keys(teamCounts).filter((team) => teamCounts[team] === highest);
  const winnerNames = winners.map((team) => teams[team].name).join(" and ");

  // Highlight the winning team card(s)
  document.querySelectorAll(".team-card").forEach((card) => card.classList.remove("winner"));
  winners.forEach((team) => document.querySelector(".team-card." + team).classList.add("winner"));

  const tieText = winners.length > 1 ? " are tied for the win" : " wins";
  showMessage("🎉 We hit our goal of " + maxCount + " attendees! " + winnerNames + tieText + " with " + highest + " check-ins! 🏆", true);
}

// Handle the check-in form
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading

  const name = nameInput.value.trim();
  const team = teamSelect.value;
  if (name === "" || team === "") return;

  // Update the counts
  count++;
  teamCounts[team]++;
  const attendee = { name: name, team: team };
  attendees.push(attendee);

  // Update the page
  updateAttendance();
  updateTeamCounts();
  addToList(attendee);
  showMessage("👋 Welcome, " + name + " from " + teams[team].name + "!", false);
  checkForCelebration();

  // Save and reset the form
  saveProgress();
  form.reset();
  nameInput.focus();
});

// On page load, show any saved progress
updateAttendance();
updateTeamCounts();
attendees.forEach(addToList);
checkForCelebration();