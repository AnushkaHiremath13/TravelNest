// DOM Elements
const addResortBtn = document.getElementById('addResortBtn');
const resortModal = document.getElementById('resortModal');
const closeModal = document.querySelector('.close');
const resortForm = document.getElementById('resortForm');
const resortList = document.getElementById('resortList');
const searchBtn = document.getElementById('searchBtn');
const resortNameSearch = document.getElementById('resortNameSearch');
const locationSearch = document.getElementById('locationSearch');
const priceRangeSearch = document.getElementById('priceRangeSearch');

// Constants
const BASE_URL = 'http://localhost:5000';

// Helper function to check server connection
async function checkServerConnection() {
    try {
        console.log('Checking server connection...');
        const response = await fetch(`${BASE_URL}/api/health-check`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Server response:', response);
        if (!response.ok) {
            console.error('Server returned error:', response.status, response.statusText);
            const text = await response.text();
            console.error('Response text:', text);
        }
        return response.ok;
    } catch (error) {
        console.error('Server connection error:', error);
        return false;
    }
}

// Helper function to get headers with authorization
function getHeaders(isFormData = false) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'adminlogin.html';
        return null;
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    };
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
}

// Check for authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    
    if (!token || adminUser.role !== 'admin') {
        window.location.href = 'adminlogin.html';
        return false;
    }
    return true;
}

// State
let resorts = [];
let editingResortId = null;

// Image Preview Functions
function clearImagePreviews() {
    document.getElementById('mainImagePreview').innerHTML = '';
    document.getElementById('galleryPreview').innerHTML = '';
}

function setupImagePreviews() {
    const mainImageInput = document.getElementById('mainImage');
    const galleryInput = document.getElementById('gallery');
    const mainPreview = document.getElementById('mainImagePreview');
    const galleryPreview = document.getElementById('galleryPreview');

    mainImageInput.addEventListener('change', (e) => {
        mainPreview.innerHTML = '';
        const file = e.target.files[0];
        if (file) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            mainPreview.appendChild(img);
        }
    });

    galleryInput.addEventListener('change', (e) => {
        galleryPreview.innerHTML = '';
        Array.from(e.target.files).forEach(file => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            galleryPreview.appendChild(img);
        });
    });
}

// Helper function for image compression
async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                let width = img.width;
                let height = img.height;
                
                // Max dimensions
                const maxWidth = 1200;
                const maxHeight = 800;
                
                if (width > maxWidth) {
                    height = (maxWidth * height) / width;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (maxHeight * width) / height;
                    height = maxHeight;
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.7);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Load resorts with better error handling
async function loadResorts(filters = {}) {
    try {
        console.log('Loading resorts...');
        
        const headers = getHeaders();
        if (!headers) {
            console.error('No auth headers available');
            window.location.href = 'adminlogin.html';
            return;
        }

        console.log('Fetching resorts from:', `${BASE_URL}/api/admin/resorts`);
        const response = await fetch(`${BASE_URL}/api/admin/resorts`, {
            method: 'GET',
            headers,
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.error('Authentication error');
                window.location.href = 'adminlogin.html';
                return;
            }
            throw new Error(`Failed to fetch resorts: ${response.status} ${response.statusText}`);
        }

        const resorts = await response.json();
        console.log('Fetched resorts:', resorts);
        
        if (!Array.isArray(resorts)) {
            throw new Error('Invalid data format received from server');
        }

        displayResorts(resorts);
        console.log('Successfully displayed resorts.');
    } catch (error) {
        console.error('Error loading resorts:', error);
        alert('Error loading resorts: ' + error.message);
    }
}

// Edit Resort
async function editResort(resortId) {
    try {
        const headers = getHeaders();
        if (!headers) {
            window.location.href = 'adminlogin.html';
            return;
        }

        const response = await fetch(`${BASE_URL}/api/resorts/${resortId}`, {
            method: 'GET',
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
            });

            if (!response.ok) {
            throw new Error('Failed to fetch resort details');
        }

        const resort = await response.json();
        editingResortId = resortId;
        
        // Show modal
        resortModal.style.display = 'block';
        
        // Fill form with resort data
        document.getElementById('modalTitle').textContent = 'Edit Resort';
        
        // Basic Information
        const formElements = {
            'resortTitle': resort.title,
            'location': resort.location,
            'price': resort.price,
            'originalPrice': resort.originalPrice || '',
            'roomType': resort.roomType || 'Standard Room',
            'occupancy': resort.occupancy || 2,
            'rating': resort.rating,
            'ratingPhrase': resort.ratingPhrase || 'Good',
            'amenitiesRating': resort.amenitiesRating || 4,
            'shortDescription': resort.shortDescription,
            'description': Array.isArray(resort.description) ? resort.description.join('\n') : resort.description || '',
            'mapLink': resort.mapLink,
            'videoUrl': resort.vlogLink || resort.videoUrl || ''
        };

        // Fill all form elements
        Object.keys(formElements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = formElements[id];
            }
        });

        // Clear existing amenities
        const amenitiesSelect = document.getElementById('amenities');
        if (amenitiesSelect) {
        Array.from(amenitiesSelect.options).forEach(option => {
                option.selected = false;
            });
        }

        // Handle amenities
        if (resort.amenities && Array.isArray(resort.amenities)) {
            resort.amenities.forEach(amenity => {
                const option = Array.from(amenitiesSelect.options).find(opt => opt.value === amenity);
                if (option) {
                    option.selected = true;
                }
            });
        }

        // Handle packages
        const packagesContainer = document.getElementById('packagesContainer');
        if (packagesContainer) {
            packagesContainer.innerHTML = ''; // Clear existing packages
            if (resort.packages && Array.isArray(resort.packages)) {
                resort.packages.forEach(pkg => addPackage(pkg));
            }
        }

        // Handle nearby attractions
        const attractionsContainer = document.getElementById('attractionsContainer');
        if (attractionsContainer) {
            attractionsContainer.innerHTML = ''; // Clear existing attractions
            if (resort.nearbyAttractions && Array.isArray(resort.nearbyAttractions)) {
                resort.nearbyAttractions.forEach(attraction => addNearbyAttraction(attraction));
            }
        }

        // Handle images
        if (resort.imgSrc) {
            const currentImage = document.getElementById('currentImage');
            if (currentImage) {
                currentImage.src = resort.imgSrc.startsWith('http') 
                    ? resort.imgSrc 
                    : `${BASE_URL}/${resort.imgSrc.startsWith('/') ? resort.imgSrc.slice(1) : resort.imgSrc}`;
                currentImage.style.display = 'block';
            }
        }

        // Handle gallery images
        if (resort.photos && Array.isArray(resort.photos)) {
            const galleryPreview = document.getElementById('galleryPreview');
            if (galleryPreview) {
                galleryPreview.innerHTML = resort.photos.map(photo => `
                    <div class="preview-image">
                        <img src="${photo.startsWith('http') ? photo : `${BASE_URL}/${photo.startsWith('/') ? photo.slice(1) : photo}`}" 
                             alt="Gallery image">
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to load resort details');
    }
}

// Delete Resort
async function deleteResort(resortId) {
    if (!resortId) {
        console.error('No resort ID provided for deletion');
        alert('Error: No resort ID provided');
        return;
    }

    if (!confirm('Are you sure you want to delete this resort?')) {
        return;
    }

    try {
        const headers = getHeaders();
        if (!headers) {
            window.location.href = 'adminlogin.html';
            return;
        }
        
        console.log('Deleting resort with ID:', resortId);
        const response = await fetch(`${BASE_URL}/api/admin/resorts/${resortId}`, {
            method: 'DELETE',
            headers
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to delete resort');
        }

        // Refresh resort list
        await loadResorts();
        alert('Resort deleted successfully!');
    } catch (error) {
        console.error('Error deleting resort:', error);
        if (error.message.includes('authorization')) {
            window.location.href = 'adminlogin.html';
        } else {
            alert(error.message || 'Failed to delete resort. Please try again.');
        }
    }
}

// Display resorts in the UI
function displayResorts(resorts) {
    const resortList = document.getElementById('resortList');
    
    if (!resorts || resorts.length === 0) {
        resortList.innerHTML = '<p class="no-resorts">No resorts found</p>';
        return;
    }

    resortList.innerHTML = resorts.map(resort => {
        // Ensure resort has an ID
        if (!resort._id) {
            console.error('Resort missing ID:', resort);
            return '';
        }

        // Standardize image path handling
        const mainImage = resort.imgSrc ? 
            (resort.imgSrc.startsWith('http') ? resort.imgSrc :
            `${BASE_URL}/${resort.imgSrc.startsWith('/') ? resort.imgSrc.slice(1) : resort.imgSrc}`) : 
            'https://placehold.co/600x400/e9ecef/495057?text=No+Image+Available';

        return `
        <div class="resort-card" data-id="${resort._id}">
            <img 
                src="${mainImage}" 
                alt="${resort.title}" 
                class="resort-image"
                onerror="this.src='https://placehold.co/600x400/e9ecef/495057?text=No+Image+Available'"
            >
            <div class="resort-info">
                <div>
                    <h3>${resort.title}</h3>
                    <p>
                        <i class="fas fa-map-marker-alt"></i>
                        <span><strong>Location:</strong> ${resort.location}</span>
                    </p>
                    <p>
                        <i class="fas fa-rupee-sign"></i>
                        <span><strong>Price:</strong> ₹${parseFloat(resort.price).toFixed(2)}/night</span>
                    </p>
                    <p>
                        <i class="fas fa-star" style="color: #f1c40f;"></i>
                        <span><strong>Rating:</strong> ${resort.rating || 'N/A'}</span>
                    </p>
                </div>
                <p class="resort-description">${resort.shortDescription || ''}</p>
            </div>
            <div class="resort-actions">
                <button class="btn-edit" onclick="editResort('${resort._id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteResort('${resort._id}')" data-id="${resort._id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `}).join('');
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    try {
        const headers = getHeaders(true);
        if (!headers) return;

        const formData = new FormData(resortForm);
        
        // Log form data for debugging
        console.log('Form data contents:');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
            } else {
                console.log(`${key}: ${value}`);
            }
        }

        // Convert Google Maps direction link to embed link
        let mapLink = formData.get('mapLink') || '';
        if (mapLink.includes('maps/dir')) {
            // Extract the destination from the directions URL
            const destination = mapLink.split('destination=')[1];
            if (destination) {
                // Create an embed link
                mapLink = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d0!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${encodeURIComponent(destination)}!5e0!3m2!1sen!2sin!4v1`;
                formData.set('mapLink', mapLink);
            }
        }

        // Get basic form data
        const title = formData.get('resortTitle');
        formData.delete('resortTitle');
        if (title) {
            formData.set('title', title);
        }

        // Handle text fields that need to be JSON strings
        const description = formData.get('description') || '';
        formData.set('description', JSON.stringify([description]));

        // Handle amenities
        const amenitiesSelect = document.getElementById('amenities');
        const selectedAmenities = Array.from(amenitiesSelect.selectedOptions).map(option => option.value);
        formData.set('amenities', JSON.stringify(selectedAmenities));

        // Handle packages
        const packages = [];
        const packageItems = document.querySelectorAll('.package-item');
        let hasEmptyDuration = false;
        packageItems.forEach((item, index) => {
            const duration = item.querySelector('.package-duration')?.value || '';
            if (!duration.trim()) {
                hasEmptyDuration = true;
            }
            const packageData = {
                name: item.querySelector('.package-name')?.value || '',
                description: item.querySelector('.package-description')?.value || '',
                price: parseFloat(item.querySelector('.package-price')?.value || '0'),
                duration: duration.trim(),
                highlights: Array.from(item.querySelectorAll('.package-highlight')).map(input => input.value),
                inclusions: Array.from(item.querySelectorAll('.package-inclusion')).map(input => input.value),
                image: 'https://placehold.co/600x400/e9ecef/495057?text=Package+Image' // Using placeholder image
            };
            packages.push(packageData);
        });
        if (hasEmptyDuration) {
            alert('Please fill in the duration for all packages.');
            return;
        }
        formData.set('packages', JSON.stringify(packages));

        // Handle nearby attractions
        const attractions = Array.from(document.querySelectorAll('.nearby-attraction'))
            .map(input => input.value)
            .filter(value => value.trim() !== '');
        formData.set('nearbyAttractions', JSON.stringify(attractions));

        // Compress main image
        const mainImage = formData.get('imgSrc');
        if (mainImage && mainImage.size > 0) {
            const compressedImage = await compressImage(mainImage);
            formData.set('imgSrc', compressedImage, mainImage.name);
        }

        // Compress gallery images
        const galleryFiles = formData.getAll('photos');
        if (galleryFiles.length > 0) {
            formData.delete('photos');
            for (const file of galleryFiles) {
                if (file.size > 0) {
                    const compressedImage = await compressImage(file);
                    formData.append('photos', compressedImage, file.name);
                }
            }
        }

        // Handle video URL
        let videoUrl = formData.get('vlogLink') || '';
        if (videoUrl) {
            try {
                let videoId = '';

                // Handle mobile YouTube URLs
                videoUrl = videoUrl.replace('m.youtube.com', 'www.youtube.com');

                // Extract video ID from various formats
                if (videoUrl.includes('youtube.com/watch')) {
                    const urlParams = new URLSearchParams(new URL(videoUrl).search);
                    videoId = urlParams.get('v');
                } else if (videoUrl.includes('youtu.be/')) {
                    videoId = videoUrl.split('youtu.be/')[1]?.split(/[?&]/)[0];
                } else if (videoUrl.includes('youtube.com/embed/')) {
                     videoId = videoUrl.split('youtube.com/embed/')[1]?.split(/[?&]/)[0];
                }

                if (videoId) {
                    // Construct the clean embed URL with desired parameters
                    videoUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
                } else {
                    // If no valid video ID is found, clear the URL
                    videoUrl = '';
                    console.warn('Could not extract YouTube video ID from URL:', formData.get('vlogLink'));
                }

                formData.set('vlogLink', videoUrl);
            } catch (error) {
                console.error('Error processing video URL:', error);
                formData.set('vlogLink', '');
            }
        }

        const url = editingResortId 
            ? `${BASE_URL}/api/admin/resorts/${editingResortId}`
            : `${BASE_URL}/api/admin/resorts`;

        console.log('Sending request to:', url);
        console.log('Final form data:');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
            } else {
                console.log(`${key}: ${value}`);
            }
        }

        const response = await fetch(url, {
            method: editingResortId ? 'PUT' : 'POST',
            headers: {
                ...headers,
                // Don't set Content-Type here - it will be set automatically for FormData
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || 'Failed to save resort';
            } catch (e) {
                errorMessage = errorText || 'Failed to save resort';
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Resort saved successfully:', data);

        // Reset form and close modal
        resortForm.reset();
        resortModal.style.display = 'none';
        clearImagePreviews();

        // Refresh resort list
        loadResorts();
        alert(editingResortId ? 'Resort updated successfully!' : 'Resort added successfully!');
        
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to save resort. Please try again.');
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'adminlogin.html';
        return;
    }

    // Load initial data
    loadResorts();

    // Setup event listeners
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
    const filters = {
                name: document.getElementById('resortNameSearch')?.value,
                location: document.getElementById('locationSearch')?.value,
                priceRange: document.getElementById('priceRangeSearch')?.value
            };
            loadResorts(filters);
        });
    }

    // Setup add resort button
    const addResortBtn = document.getElementById('addResortBtn');
    if (addResortBtn) {
        addResortBtn.addEventListener('click', () => {
            // Reset form and show modal
            document.getElementById('resortForm')?.reset();
            document.getElementById('modalTitle').textContent = 'Add New Resort';
            editingResortId = null;
            resortModal.style.display = 'block';
        });
    }

    // Setup modal close button
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            resortModal.style.display = 'none';
        });
    }

    // Setup form submission
    if (resortForm) {
        resortForm.addEventListener('submit', handleFormSubmit);
    }

    // Setup image previews
    setupImagePreviews();
});


function addPackage(existingPackage = null) {
    const packagesContainer = document.getElementById('packagesContainer');
    const packageDiv = document.createElement('div');
    packageDiv.className = 'package-item';
    packageDiv.innerHTML = `
        <input type="text" class="package-name" placeholder="Package Name" value="${existingPackage ? existingPackage.name : ''}" required>
        <textarea class="package-description" placeholder="Package Description" required>${existingPackage ? existingPackage.description : ''}</textarea>
        <input type="number" class="package-price" placeholder="Package Price" value="${existingPackage ? existingPackage.price : ''}" required>
        <input type="text" class="package-duration" placeholder="Duration (e.g., 3 Days / 2 Nights)" value="${existingPackage ? existingPackage.duration : ''}" required>
        <input type="file" class="package-image" accept="image/*" ${existingPackage ? '' : 'required'}>
        <div class="highlights-container">
            <h4>Highlights</h4>
            <div class="highlight-items">
                ${(existingPackage && existingPackage.highlights && existingPackage.highlights.length) ? existingPackage.highlights.map((h, i) => `<input type='text' class='package-highlight' placeholder='Highlight ${i+1}' value='${h}' required>`).join('') : `<input type='text' class='package-highlight' placeholder='Highlight 1' required>`}
            </div>
            <button type="button" class="add-highlight-btn">+ Add Highlight</button>
        </div>
        <div class="inclusions-container">
            <h4>Inclusions</h4>
            <div class="inclusion-items">
                ${(existingPackage && existingPackage.inclusions && existingPackage.inclusions.length) ? existingPackage.inclusions.map((inc, i) => `<input type='text' class='package-inclusion' placeholder='Inclusion ${i+1}' value='${inc}' required>`).join('') : `<input type='text' class='package-inclusion' placeholder='Inclusion 1' required>`}
            </div>
            <button type="button" class="add-inclusion-btn">+ Add Inclusion</button>
        </div>
        <button type="button" class="remove-package-btn">Remove Package</button>
    `;
    // Remove package event
    packageDiv.querySelector('.remove-package-btn').addEventListener('click', function() {
        packagesContainer.removeChild(packageDiv);
    });
    // Add highlight event
    packageDiv.querySelector('.add-highlight-btn').addEventListener('click', function() {
        const highlightItems = packageDiv.querySelector('.highlight-items');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'package-highlight';
        input.placeholder = `Highlight ${highlightItems.children.length + 1}`;
        input.required = true;
        highlightItems.appendChild(input);
    });
    // Add inclusion event
    packageDiv.querySelector('.add-inclusion-btn').addEventListener('click', function() {
        const inclusionItems = packageDiv.querySelector('.inclusion-items');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'package-inclusion';
        input.placeholder = `Inclusion ${inclusionItems.children.length + 1}`;
        input.required = true;
        inclusionItems.appendChild(input);
    });
    packagesContainer.appendChild(packageDiv);
}

// Add a nearby attraction input dynamically
function addNearbyAttraction(attraction = '') {
    const attractionsContainer = document.getElementById('attractionsContainer');
    const div = document.createElement('div');
    div.className = 'nearby-attraction-item';
    div.innerHTML = `
        <input type="text" class="nearby-attraction" value="${attraction}" placeholder="Nearby Attraction" />
        <button type="button" class="remove-attraction">Remove</button>
    `;
    div.querySelector('.remove-attraction').addEventListener('click', () => {
        attractionsContainer.removeChild(div);
    });
    attractionsContainer.appendChild(div);
}
