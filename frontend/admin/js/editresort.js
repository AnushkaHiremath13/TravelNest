// editresort.js
document.addEventListener('DOMContentLoaded', () => {
    const resortId = new URLSearchParams(window.location.search).get('id');
    const form = document.getElementById('resortForm');
    const statusMsg = document.getElementById('statusMsg');
  
    if (!resortId) {
      statusMsg.textContent = 'No resort ID found in the URL.';
      return;
    }
  
    // Fetch resort details
    fetch(`http://localhost:5000/api/resorts/${resortId}`)
      .then(res => res.json())
      .then(data => {
        form.title.value = data.title;
        form.location.value = data.location;
        form.price.value = data.price;
        form.rating.value = data.rating;
        form.amenities.value = data.amenities?.join(', ') || '';
        form.shortDescription.value = data.shortDescription || '';
        form.description.value = data.description;

        // Handle nearby attractions
        const attractionsContainer = document.getElementById('attractionsContainer');
        if (attractionsContainer) {
            attractionsContainer.innerHTML = ''; // Clear existing attractions
            if (data.nearbyAttractions && Array.isArray(data.nearbyAttractions)) {
                data.nearbyAttractions.forEach(attraction => {
                    const attractionDiv = document.createElement('div');
                    attractionDiv.className = 'attraction-item';
                    
                    attractionDiv.innerHTML = `
                        <input type="text" placeholder="Attraction Name" 
                               value="${attraction.name || ''}" 
                               class="attraction-name" />
                        <input type="text" placeholder="Distance from Resort" 
                               value="${attraction.distance || ''}" 
                               class="attraction-distance" />
                        <textarea placeholder="Attraction Description" 
                                  class="attraction-description">${attraction.description || ''}</textarea>
                        <button type="button" class="remove-attraction">Remove Attraction</button>
                    `;

                    // Add event listener to remove button
                    attractionDiv.querySelector('.remove-attraction').addEventListener('click', function() {
                        attractionsContainer.removeChild(attractionDiv);
                    });

                    attractionsContainer.appendChild(attractionDiv);
                });
            }
        }
      })
      .catch(err => {
        console.error(err);
        statusMsg.textContent = 'Failed to load resort details.';
      });
  
    // Handle form submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const formData = new FormData(form);
      const updatedResort = {
        title: formData.get('title'),
        location: formData.get('location'),
        price: parseFloat(formData.get('price')),
        rating: parseFloat(formData.get('rating')),
        amenities: formData.get('amenities').split(',').map(a => a.trim()),
        shortDescription: formData.get('shortDescription'),
        description: formData.get('description'),
        // Add nearby attractions
        nearbyAttractions: Array.from(document.querySelectorAll('.attraction-item')).map(item => ({
            name: item.querySelector('.attraction-name').value,
            distance: item.querySelector('.attraction-distance').value,
            description: item.querySelector('.attraction-description').value
        }))
      };
  
      const files = formData.getAll('images');
      const uploadFormData = new FormData();
      uploadFormData.append('resortData', JSON.stringify(updatedResort));
      for (const file of files) {
        if (file && file.name) uploadFormData.append('images', file);
      }
  
      try {
        const res = await fetch(`http://localhost:5000/api/resorts/${resortId}`, {
          method: 'PUT',
          body: uploadFormData,
        });
  
        if (!res.ok) throw new Error('Update failed');
        alert('Resort updated successfully!');
        window.location.href = './resortslist.html';
      } catch (err) {
        console.error(err);
        statusMsg.textContent = 'Update failed. Please try again.';
      }
    });
  });
  