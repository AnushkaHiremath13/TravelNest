document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const resortId = urlParams.get('id');
  
    if (!resortId) {
      alert('Invalid resort ID');
      window.location.href = '/admin/dashboard.html';
      return;
    }
  
    fetch(`http://localhost:5000/api/resorts/${resortId}`)
      .then(res => res.json())
      .then(data => {
        document.getElementById('resortTitle').textContent = data.title;
        document.getElementById('resortLocation').textContent = data.location;
        const formattedPrice = parseFloat(data.price).toFixed(2);
        document.getElementById('resortPrice').textContent = `Price per night: ₹${formattedPrice}`;
        document.getElementById('resortRating').textContent = `Rating: ${data.rating}/5`;
        document.getElementById('resortDescription').textContent = data.description;
  
        const imageContainer = document.getElementById('resortImages');
        data.photos?.forEach(photo => {
          const img = document.createElement('img');
          const imgPath = photo.startsWith('http') ? photo :
              `http://localhost:5000/${photo.startsWith('/') ? photo.slice(1) : photo}`;
          img.src = imgPath;
          img.alt = data.title;
          imageContainer.appendChild(img);
        });
  
        const amenitiesList = document.getElementById('resortAmenities');
        data.amenities?.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          amenitiesList.appendChild(li);
        });
  
        if (data.mapLink) {
          document.getElementById('resortMap').src = data.mapLink;
        }
      })
      .catch(err => {
        console.error('Error fetching resort details:', err);
        alert('Failed to load resort details');
      });
  });
  