// add-resort.js

// Handle dynamic form elements
document.addEventListener('DOMContentLoaded', function() {
    // Package management
    const packagesContainer = document.getElementById('packagesContainer');
    const addPackageBtn = document.querySelector('.add-package-btn');

    // Add new package
    addPackageBtn.addEventListener('click', () => {
        const newPackage = document.createElement('div');
        newPackage.className = 'package-item';
        newPackage.innerHTML = `
            <input type="text" class="package-name" placeholder="Package Name" required>
            <textarea class="package-description" placeholder="Package Description" required></textarea>
            <input type="number" class="package-price" placeholder="Package Price" required>
            <input type="text" class="package-duration" placeholder="Duration (e.g., 3 Days / 2 Nights)" required>
            <input type="file" class="package-image" accept="image/*" required>
            
            <div class="highlights-container">
                <h3>Highlights</h3>
                <div class="highlight-items">
                    <input type="text" class="package-highlight" placeholder="Highlight 1" required>
                </div>
                <button type="button" class="add-highlight-btn">+ Add Highlight</button>
            </div>

            <div class="inclusions-container">
                <h3>Inclusions</h3>
                <div class="inclusion-items">
                    <input type="text" class="package-inclusion" placeholder="Inclusion 1" required>
                </div>
                <button type="button" class="add-inclusion-btn">+ Add Inclusion</button>
            </div>
            <button type="button" class="remove-package-btn">Remove Package</button>
        `;
        packagesContainer.insertBefore(newPackage, addPackageBtn);
    });

    // Remove package
    packagesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-package-btn')) {
            e.target.closest('.package-item').remove();
        }
    });

    // Add highlight
    packagesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-highlight-btn')) {
            const highlightsContainer = e.target.previousElementSibling;
            const newHighlight = document.createElement('input');
            newHighlight.type = 'text';
            newHighlight.className = 'package-highlight';
            newHighlight.placeholder = `Highlight ${highlightsContainer.children.length + 1}`;
            newHighlight.required = true;
            highlightsContainer.appendChild(newHighlight);
        }
    });

    // Add inclusion
    packagesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-inclusion-btn')) {
            const inclusionsContainer = e.target.previousElementSibling;
            const newInclusion = document.createElement('input');
            newInclusion.type = 'text';
            newInclusion.className = 'package-inclusion';
            newInclusion.placeholder = `Inclusion ${inclusionsContainer.children.length + 1}`;
            newInclusion.required = true;
            inclusionsContainer.appendChild(newInclusion);
        }
    });

    // Nearby attractions management
    const attractionsContainer = document.getElementById('attractionsContainer');
    const addAttractionBtn = document.querySelector('.add-attraction-btn');

    // Add new attraction
    addAttractionBtn.addEventListener('click', () => {
        const newAttraction = document.createElement('input');
        newAttraction.type = 'text';
        newAttraction.className = 'nearby-attraction';
        newAttraction.placeholder = 'Attraction with distance';
        newAttraction.required = true;
        attractionsContainer.insertBefore(newAttraction, addAttractionBtn);
    });
});

// Form submission
document.getElementById('resortForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    const statusMsg = document.getElementById('statusMsg');

    try {
        // Basic information
        formData.append('title', document.getElementById('title').value);
        formData.append('location', document.getElementById('location').value);
        formData.append('price', document.getElementById('price').value);
        formData.append('rating', document.getElementById('rating').value);
        formData.append('shortDescription', document.getElementById('shortDescription').value);

        // Optional fields
        const originalPrice = document.getElementById('originalPrice').value;
        if (originalPrice) {
            formData.append('originalPrice', originalPrice);
        }

        formData.append('roomType', document.getElementById('roomType').value || 'Standard Room');
        formData.append('occupancy', document.getElementById('occupancy').value || '2');
        formData.append('ratingPhrase', document.getElementById('ratingPhrase').value || 'Good');
        formData.append('amenitiesRating', document.getElementById('amenitiesRating').value || '4');

        // Description
        const description = document.getElementById('description').value;
        formData.append('description', JSON.stringify(description ? [description] : []));

        // Amenities
        const amenitiesStr = document.getElementById('amenities').value;
        const amenitiesArray = amenitiesStr.split(',').map(item => item.trim()).filter(item => item);
        formData.append('amenities', JSON.stringify(amenitiesArray));

        // Images
        const imageFiles = document.getElementById('images').files;
        if (imageFiles.length === 0) {
            throw new Error('Please select at least one image');
        }
        formData.append('imgSrc', imageFiles[0]); // Main image
        
        // Additional photos
        const photos = [];
        for (let i = 1; i < imageFiles.length; i++) {
            formData.append('photos', imageFiles[i]);
        }

        // Links
        const mapLink = document.getElementById('mapLink').value;
        if (!mapLink.includes('google.com/maps')) {
            throw new Error('Please provide a valid Google Maps link');
        }
        formData.append('mapLink', mapLink);

        const vlogLink = document.getElementById('vlogLink').value;
        if (vlogLink) {
            formData.append('vlogLink', vlogLink);
        }

        // Packages
        const packages = [];
        const packageElements = document.querySelectorAll('.package-item');
        
        packageElements.forEach((packageItem, index) => {
            const packageImage = packageItem.querySelector('.package-image').files[0];
            if (!packageImage) {
                throw new Error(`Please select an image for package ${index + 1}`);
            }

            const packageData = {
                name: packageItem.querySelector('.package-name').value,
                description: packageItem.querySelector('.package-description').value,
                price: parseFloat(packageItem.querySelector('.package-price').value),
                duration: packageItem.querySelector('.package-duration').value,
                highlights: Array.from(packageItem.querySelectorAll('.package-highlight'))
                    .map(h => h.value.trim())
                    .filter(h => h),
                inclusions: Array.from(packageItem.querySelectorAll('.package-inclusion'))
                    .map(i => i.value.trim())
                    .filter(i => i)
            };

            // Validate package data
            if (!packageData.name) throw new Error(`Package ${index + 1} name is required`);
            if (!packageData.description) throw new Error(`Package ${index + 1} description is required`);
            if (!packageData.price || packageData.price <= 0) throw new Error(`Package ${index + 1} must have a valid price`);
            if (!packageData.duration) throw new Error(`Package ${index + 1} duration is required`);
            if (packageData.highlights.length === 0) throw new Error(`Package ${index + 1} must have at least one highlight`);
            if (packageData.inclusions.length === 0) throw new Error(`Package ${index + 1} must have at least one inclusion`);

            formData.append(`packageImage_${index}`, packageImage);
            packages.push(packageData);
        });

        if (packages.length > 0) {
            formData.append('packages', JSON.stringify(packages));
        }

        // Nearby Attractions
        const attractions = Array.from(document.querySelectorAll('.nearby-attraction'))
            .map(a => a.value.trim())
            .filter(a => a);
        formData.append('nearbyAttractions', JSON.stringify(attractions));

        // Log form data for debugging
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}:`, 'File:', value.name, 'Type:', value.type, 'Size:', value.size);
            } else {
                console.log(`${key}:`, value);
            }
        }

        // Send to server
        const response = await fetch('http://localhost:5000/api/admin/resorts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        const responseText = await response.text();
        console.log('Server response:', responseText);

        if (!response.ok) {
            let errorMessage;
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || errorData.error || 'Failed to add resort';
            } catch (e) {
                errorMessage = responseText || 'Failed to add resort';
            }
            throw new Error(errorMessage);
        }

        statusMsg.textContent = 'Resort added successfully!';
        statusMsg.className = 'status-message success';
        
        // Redirect after 2 seconds
        setTimeout(() => {
            window.location.href = 'manage-resorts.html';
        }, 2000);

    } catch (error) {
        console.error('Error:', error);
        statusMsg.textContent = error.message || 'Failed to add resort. Please try again.';
        statusMsg.className = 'status-message error';
    }
});
  