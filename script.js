import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  "https://geovhaihpvrxojxltksa.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlb3ZoYWlocHZyeG9qeGx0a3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNTQ5MTMsImV4cCI6MjA4MzgzMDkxM30.ZpiLjOIdn6s3g-HnZiawDgoS98Qmb8XG0ulHCpGuxMg"
);

/* Add appointment */
async function add() {
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');

  if (!dateInput.value || !timeInput.value) {
    alert("Pick date & time");
    return;
  }

  const { error } = await supabase.from("appointments").insert({
    date: dateInput.value,
    time: timeInput.value,
    status: "pending"
  });

  if (error) {
    console.error(error);
    return;
  }

  load();
}

/* Load appointments */
async function load() {
  const { data, error } = await supabase
    .from("appointments")
    .select("id, date, time, status")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const listDiv = document.getElementById('list');
  listDiv.innerHTML = "";

  data.forEach(a => {
    const card = document.createElement('div');
    card.className = `card ${a.status}`;

    /* Content */
    const content = document.createElement('div');
    content.innerHTML = `<b>${a.date} ${a.time}</b><br>Status: ${a.status}`;
    card.appendChild(content);

    /* Button group */
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';

    const acceptBtn = document.createElement('button');
    acceptBtn.textContent = 'Accept';
    acceptBtn.onclick = () => setStatus(a.id, 'Accepted');

    const rejectBtn = document.createElement('button');
    rejectBtn.textContent = 'Reject';
    rejectBtn.onclick = () => setStatus(a.id, 'Rejected');

    buttonGroup.append(acceptBtn, rejectBtn);
    card.appendChild(buttonGroup);

    /* Delete X — ONLY delete trigger */
    const deleteX = document.createElement('button');
    deleteX.className = 'delete-x';
    deleteX.textContent = '×';
    deleteX.setAttribute('aria-label', 'Delete appointment');

    deleteX.addEventListener('click', (e) => {
      e.stopPropagation(); // 🔒 critical: prevents card click side effects
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
