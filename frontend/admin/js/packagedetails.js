document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const packageId = urlParams.get('id');
  
    if (!packageId) {
      alert('Invalid package ID');
      window.location.href = '/admin/dashboard.html';
      return;
    }
  
    fetch(`http://localhost:5000/api/packages/${packageId}`)
      .then(res => res.json())
      .then(data => {
        document.getElementById('packageTitle').textContent = data.title;
        document.getElementById('packageResort').textContent = `Resort: ${data.resortName || 'N/A'}`;
        document.getElementById('packagePrice').textContent = `Price: $${data.price}`;
        document.getElementById('packageDuration').textContent = `Duration: ${data.duration} days`;
        document.getElementById('packageDescription').textContent = data.description;
  
        const amenitiesList = document.getElementById('packageAmenities');
        data.amenities?.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          amenitiesList.appendChild(li);
        });
      })
      .catch(err => {
        console.error('Error fetching package details:', err);
        alert('Failed to load package details');
      });
  });
  