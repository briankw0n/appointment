import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  "https://geovhaihpvrxojxltksa.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlb3ZoYWlocHZyeG9qeGx0a3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNTQ5MTMsImV4cCI6MjA4MzgzMDkxM30.ZpiLjOIdn6s3g-HnZiawDgoS98Qmb8XG0ulHCpGuxMg"
);

/* Helper: format HH:MM to 12-hour with AM/PM */
function format12HourTime(timeStr) {
  let [hour, minute] = timeStr.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12; // midnight/noon fix
  return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

/* Add appointment */
async function load() {
  const { data, error } = await supabase
    .from("appointments")
    .select("id, date, time, status")
    .order("created_at", { ascending: false }); // initial fetch

  if (error) {
    console.error(error);
    return;
  }

  // Custom sort: pending → accepted → rejected, then by time ascending
  const statusPriority = { pending: 1, accepted: 2, rejected: 3 };

  data.sort((a, b) => {
    // Compare status priority
    const statusDiff = statusPriority[a.status.toLowerCase()] - statusPriority[b.status.toLowerCase()];
    if (statusDiff !== 0) return statusDiff;

    // Same status → sort by date and time
    const dateTimeA = new Date(`${a.date}T${a.time}`);
    const dateTimeB = new Date(`${b.date}T${b.time}`);
    return dateTimeA - dateTimeB;
  });

  const listDiv = document.getElementById('list');
  listDiv.innerHTML = "";

  data.forEach(a => {
    const statusClass = a.status.toLowerCase().trim(); // normalize

    const card = document.createElement('div');
    card.className = `card ${statusClass}`;

    /* Content with 12-hour time */
    const content = document.createElement('div');
    const formattedTime = format12HourTime(a.time);
    content.innerHTML = `<b>${a.date} ${formattedTime}</b><br>Status: ${a.status}`;
    card.appendChild(content);

    /* Button group */
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';

    const acceptBtn = document.createElement('button');
    acceptBtn.textContent = 'Accept';
    acceptBtn.onclick = () => setStatus(a.id, 'accepted');

    const rejectBtn = document.createElement('button');
    rejectBtn.textContent = 'Reject';
    rejectBtn.onclick = () => setStatus(a.id, 'rejected');

    buttonGroup.append(acceptBtn, rejectBtn);
    card.appendChild(buttonGroup);

    /* Delete X */
    const deleteX = document.createElement('button');
    deleteX.className = 'delete-x';
    deleteX.textContent = '×';
    deleteX.setAttribute('aria-label', 'Delete appointment');

    deleteX.addEventListener('click', (e) => {
      e.stopPropagation();
      remove(a.id);
    });

    card.appendChild(deleteX);
    listDiv.appendChild(card);
  });
}

/* Update status */
async function setStatus(id, status) {
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  load();
}

/* Delete appointment */
async function remove(id) {
  if (!confirm("Delete this appointment?")) return;

  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  load();
}

/* Events */
document.getElementById('requestBtn').addEventListener('click', add);

/* Initial load */
load();
