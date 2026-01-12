import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 🔴 Replace with your Supabase Project URL and anon key
const supabase = createClient(
  "https://geovhaihpvrxojxltksa.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlb3ZoYWlocHZyeG9qeGx0a3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNTQ5MTMsImV4cCI6MjA4MzgzMDkxM30.ZpiLjOIdn6s3g-HnZiawDgoS98Qmb8XG0ulHCpGuxMg"
);

// Add appointment
async function add() {
  const dateInput = document.getElementById('date')
  const timeInput = document.getElementById('time')
  if (!dateInput.value || !timeInput.value) return alert("Pick date & time")

  await supabase.from("appointments").insert({
    date: dateInput.value,
    time: timeInput.value,
    status: "pending"
  })

  load()
}

// Load all appointments
async function load() {
  const { data, error } = await supabase
    .from("appointments")
    .select("id, date, time, status")
    .order("created_at", { ascending: false })

  if (error) { console.error(error); return }

  const listDiv = document.getElementById('list')
  listDiv.innerHTML = ""

  data.forEach(a => {
    const card = document.createElement('div')
    card.className = `card ${a.status}`
    card.innerHTML = `<b>${a.date} ${a.time}</b><br>Status: ${a.status}`

    const buttonGroup = document.createElement('div')
    buttonGroup.className = 'button-group'

    const acceptBtn = document.createElement('button')
    acceptBtn.textContent = 'Accept'
    acceptBtn.onclick = () => setStatus(a.id, 'accepted')
    buttonGroup.appendChild(acceptBtn)

    const rejectBtn = document.createElement('button')
    rejectBtn.textContent = 'Reject'
    rejectBtn.onclick = () => setStatus(a.id, 'rejected')
    buttonGroup.appendChild(rejectBtn)

    const deleteBtn = document.createElement('button')
    deleteBtn.textContent = 'Delete'
    deleteBtn.className = 'delete'
    deleteBtn.onclick = () => remove(a.id)
    buttonGroup.appendChild(deleteBtn)

    card.appendChild(buttonGroup)
    listDiv.appendChild(card)
  })
}

// Update status
async function setStatus(id, status) {
  await supabase.from("appointments").update({ status }).eq("id", id)
  load()
}

// Delete appointment
async function remove(id) {
  if (!confirm("Delete this appointment?")) return
  await supabase.from("appointments").delete().eq("id", id)
  load()
}

// Attach event listener
document.getElementById('requestBtn').addEventListener('click', add)

// Load appointments initially
load()
