document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.querySelector("#resortsTable tbody");

  try {
    const res = await fetch("http://localhost:5000/api/resorts");
    const resorts = await res.json();

    resorts.forEach(resort => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${resort.title}</td>
        <td>${resort.location}</td>
        <td>$${resort.price}</td>
        <td>${resort.rating}</td>
        <td class="action-btns">
          <button class="view-btn" onclick="viewResort('${resort._id}')">View</button>
          <button class="edit-btn" onclick="editResort('${resort._id}')">Edit</button>
          <button class="delete-btn" onclick="deleteResort('${resort._id}')">Delete</button>
        </td>
      `;

      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error("Failed to fetch resorts", err);
  }
});

function viewResort(id) {
  window.location.href = `/admin/resort-details.html?id=${id}`;
}

function editResort(id) {
  window.location.href = `/admin/edit-resort.html?id=${id}`;
}

async function deleteResort(id) {
  if (!confirm("Are you sure you want to delete this resort?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/resorts/${id}`, {
      method: "DELETE"
    });

    if (res.ok) {
      location.reload();
    } else {
      alert("Delete failed");
    }
  } catch (err) {
    console.error("Delete error", err);
    alert("Something went wrong");
  }
}
