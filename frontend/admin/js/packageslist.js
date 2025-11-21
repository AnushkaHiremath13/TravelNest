document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('packagesTable');

  // Fetch packages from the server
  fetch('http://localhost:5000/api/packages')
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(data => {
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      data.forEach(pkg => {
        const row = document.createElement('tr');

        row.innerHTML = `
          <td>${escapeHTML(pkg.title)}</td>
          <td>${escapeHTML(pkg.resort || 'N/A')}</td>
          <td>${pkg.price ? `₹${pkg.price}` : 'N/A'}</td>
          <td>${escapeHTML(pkg.description)}</td>
          <td>${(pkg.amenities && pkg.amenities.length) ? pkg.amenities.map(escapeHTML).join(', ') : 'None'}</td>
          <td class="action-btns">
            <button class="view-btn" onclick="viewPackage('${pkg._id}')">View</button>
            <button class="edit-btn" onclick="editPackage('${pkg._id}')">Edit</button>
            <button class="delete-btn" onclick="deletePackage('${pkg._id}')">Delete</button>
          </td>
        `;

        tableBody.appendChild(row);
      });
    })
    .catch(err => {
      console.error('Failed to load packages:', err);
      tableBody.innerHTML = '<tr><td colspan="6" style="color:red; text-align:center;">Failed to load packages</td></tr>';
    });
});

// Redirect to view page
function viewPackage(id) {
  window.location.href = `/admin/package-details.html?id=${id}`;
}

// Redirect to edit page
function editPackage(id) {
  window.location.href = `/admin/edit-package.html?id=${id}`;
}

// Delete a package
function deletePackage(id) {
  if (!confirm('Are you sure you want to delete this package?')) return;

  fetch(`http://localhost:5000/api/packages/${id}`, {
    method: 'DELETE',
  })
    .then(res => {
      if (!res.ok) throw new Error('Delete failed');
      alert('Package deleted successfully');
      location.reload();
    })
    .catch(err => {
      console.error('Delete error:', err);
      alert('Failed to delete the package. Please try again.');
    });
}

// Escape HTML to prevent XSS
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
