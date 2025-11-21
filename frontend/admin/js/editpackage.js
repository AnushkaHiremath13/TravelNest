// edit-package.js

document.addEventListener('DOMContentLoaded', async () => {
    const packageId = new URLSearchParams(window.location.search).get('id');
    const form = document.getElementById('packageForm');
    const statusMsg = document.getElementById('statusMsg');
  
    if (!packageId) {
      statusMsg.textContent = 'No package ID provided in URL.';
      return;
    }
  
    // Fetch existing package data
    try {
      const res = await fetch(`http://localhost:5000/api/packages/${packageId}`);
      const data = await res.json();
  
      if (!res.ok) {
        statusMsg.textContent = data.msg || 'Failed to load package';
        return;
      }
  
      // Populate form fields
      form.title.value = data.title || '';
      form.duration.value = data.duration || '';
      form.price.value = data.price || '';
      form.description.value = data.description || '';
      form.amenities.value = data.amenities ? data.amenities.join(', ') : '';
    } catch (err) {
      console.error('Error loading package:', err);
      statusMsg.textContent = 'Error loading package data.';
    }
  
    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      statusMsg.textContent = '';
  
      const updatedPackage = {
        title: form.title.value.trim(),
        duration: form.duration.value.trim(),
        price: parseFloat(form.price.value),
        description: form.description.value.trim(),
        amenities: form.amenities.value.split(',').map(a => a.trim()),
      };
  
      try {
        const res = await fetch(`http://localhost:5000/api/packages/${packageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPackage),
        });
  
        const data = await res.json();
        if (!res.ok) {
          statusMsg.textContent = data.msg || 'Update failed';
          return;
        }
  
        statusMsg.style.color = 'green';
        statusMsg.textContent = 'Package updated successfully!';
      } catch (err) {
        console.error('Update error:', err);
        statusMsg.textContent = 'Server error during update.';
      }
    });
  });
  