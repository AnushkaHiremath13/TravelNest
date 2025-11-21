document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, initializing resort page...');
    
    // Debugging info
    console.log('Current URL:', window.location.href);
    console.log('Query Parameters:', Array.from(new URLSearchParams(window.location.search).entries()));
    
    try {
        // Get resort ID from URL
        const resortId = getResortIdFromURL();
        if (!resortId) {
            console.log('No resort ID found, stopping initialization');
            return;
        }
  
        // Initialize the page
        initializePage();
        
        // Fetch and display resort data
        fetchAndDisplayResort(resortId);
    } catch (error) {
        console.error('Initialization error:', error);
        showErrorUI(
            'Failed to initialize page',
            'We encountered an unexpected error. Please try again later.',
            'search.html',
            'Back to Resorts'
        );
    }
  });
  
  // Initialize page elements and event listeners
  function initializePage() {
    // Create modal if it doesn't exist
    if (!document.getElementById('image-modal')) {
        const modalHTML = `
            <div id="image-modal" class="image-modal">
                <span class="close-modal">&times;</span>
                <div class="modal-content">
                    <img class="modal-image" alt="Resort Image">
                </div>
                <div class="modal-nav">
                    <button class="nav-btn prev-btn">&lt;</button>
                    <button class="nav-btn next-btn">&gt;</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
  }
  
  // Utility Functions
  function getResortIdFromURL() {
    console.log('Getting resort ID from URL...');
    
    try {
        // Check both standard query params and hash params
        const urlParams = new URLSearchParams(window.location.search);
        let resortId = urlParams.get('id');
        
        // If not found in query params, check hash
        if (!resortId && window.location.hash.includes('id=')) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            resortId = hashParams.get('id');
        }
        
        console.log('Extracted resort ID:', resortId);
        
        if (!resortId) {
            console.warn('No resort ID found in URL');
            showErrorUI(
                'No resort selected!', 
                'Please select a resort from our listings to view details.',
                'search.html',
                'Browse Resorts'
            );
            
            // Redirect after 3 seconds if user doesn't click the button
            setTimeout(() => {
                window.location.href = 'search.html';
            }, 3000);
            
            return null;
        }
        
        // Basic validation for the ID
        if (typeof resortId !== 'string' || resortId.trim() === '') {
            console.warn('Invalid resort ID format:', resortId);
            showErrorUI(
                'Invalid Resort ID',
                'The resort ID is not valid. Please select a resort from our listings.',
                'search.html',
                'Browse Resorts'
            );
            return null;
        }
        
        return resortId;
    } catch (error) {
        console.error('Error parsing URL:', error);
        showErrorUI(
            'Page Error',
            'There was a problem loading this page.',
            'search.html',
            'Back to Resorts'
        );
        return null;
    }
  }
  
  async function fetchAndDisplayResort(resortId) {
    console.log(`Fetching resort data for ID: ${resortId}`);
    
    try {
        // Check if all required elements exist
        if (!checkRequiredElements()) return;
        
        // Show loading state
        const mainElement = document.querySelector('main');
        if (mainElement) {
            mainElement.style.opacity = '0.5';
        }
        
        const resort = await fetchResortData(resortId);
        if (!resort) {
            throw new Error('No resort data received');
        }
        
        console.log('Resort data received:', resort);
        
        // Hide loading state
        if (mainElement) {
            mainElement.style.opacity = '1';
        }
        
        // Display all sections with error handling
        try {
            displayResortHeroSection(resort);
        } catch (error) {
            console.error('Error displaying hero section:', error);
        }
        
        try {
            displayResortDetails(resort);
        } catch (error) {
            console.error('Error displaying resort details:', error);
        }
        
        try {
            setupGallery(resort);
        } catch (error) {
            console.error('Error setting up gallery:', error);
        }
        
        try {
            displayAmenities(resort);
        } catch (error) {
            console.error('Error displaying amenities:', error);
        }
        
        try {
            updateVideoSection(resort);
        } catch (error) {
            console.error('Error updating video section:', error);
        }
        
        try {
            updateMapSection(resort);
        } catch (error) {
            console.error('Error updating map section:', error);
        }
        
        try {
            setupBookingButton(resort._id);
        } catch (error) {
            console.error('Error setting up booking button:', error);
        }
        
    } catch (error) {
        console.error('Error loading resort:', error);
        showErrorUI(
            'Resort Loading Failed',
            'We couldn\'t load the resort details. Please try again later.',
            'search.html',
            'Back to Resorts'
        );
    }
  }
  
  // Data Fetching
  async function fetchResortData(resortId) {
    console.log(`Making API request for resort ${resortId}`);
    
    try {
        // Using a more robust API endpoint construction with absolute URL
        const apiUrl = `http://localhost:5000/api/resorts/${encodeURIComponent(resortId)}`;
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('API error response:', {
                status: response.status,
                error: errorData?.message || 'Unknown error'
            });
            throw new Error(errorData?.message || 'Failed to fetch resort data');
        }
        
        const resort = await response.json();
        
        if (!resort || resort.error) {
            console.warn('Invalid resort data received:', resort);
            throw new Error(resort.error || 'Invalid resort data');
        }

        // Format image paths
        if (resort.imgSrc) {
            resort.imgSrc = resort.imgSrc.replace(/^\.\.\//, '').replace(/\/+/g, '/');
        }
        
        if (Array.isArray(resort.photos)) {
            resort.photos = resort.photos.map(photo => 
                photo ? photo.replace(/^\.\.\//, '').replace(/\/+/g, '/') : photo
            );
        }

        // Format package image paths if they exist
        if (Array.isArray(resort.packages)) {
            resort.packages = resort.packages.map(pkg => ({
                ...pkg,
                image: pkg.image ? getImagePath(pkg.image) : ''
            }));
        }
        
        console.log('Processed resort data:', resort);
        return resort;
        
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
  }
  
  // Display Functions
  function displayResortHeroSection(resort) {
    console.log('Displaying hero section...');
    
    const mainPhoto = getMainPhoto(resort);
    const heroSection = document.querySelector('.hero-section');
    
    if (heroSection) {
        if (mainPhoto) {
            console.log(`Setting hero image: ${mainPhoto}`);
            const imageUrl = getImagePath(mainPhoto);
            console.log('Processed image URL:', imageUrl);
            heroSection.style.backgroundImage = `
                linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), 
                url('${imageUrl}')`;
        } else {
            console.warn('No main photo available for this resort');
            heroSection.style.backgroundColor = '#f0f0f0';
        }
    } else {
        console.warn('Hero section element not found');
    }
    
    // Update text elements with explicit checks
    const resortNameEl = document.getElementById('resort-name');
    if (resortNameEl) {
        resortNameEl.textContent = resort.title || 'Unnamed Resort';
    } else {
        console.error('Element #resort-name not found');
    }

    const resortLocationEl = document.getElementById('resort-location');
    if (resortLocationEl) {
        resortLocationEl.textContent = resort.location || 'Location not available';
    } else {
        console.error('Element #resort-location not found');
    }

    const resortPriceEl = document.getElementById('resort-price');
    if (resortPriceEl) {
         resortPriceEl.textContent = resort.price ? `₹${parseFloat(resort.price).toFixed(2)}` : '₹0.00';
    } else {
        console.error('Element #resort-price not found');
    }

    const resortRatingEl = document.getElementById('resort-rating');
    if (resortRatingEl) {
        resortRatingEl.textContent = resort.rating ? resort.rating.toFixed(1) : '0.0';
    } else {
        console.error('Element #resort-rating not found');
    }
  }
  
  function displayResortDetails(resort) {
    console.log('Displaying resort details...');
    
    const descriptionEl = document.getElementById('resort-description');
    if (!descriptionEl) return;
    
    let descriptionHTML = '';
    
    if (Array.isArray(resort.description)) {
        descriptionHTML = resort.description
            .filter(p => p && p.trim() !== '')
            .map(p => `<p>${p}</p>`)
            .join('');
    } else if (resort.description) {
        descriptionHTML = `<p>${resort.description}</p>`;
    } else if (resort.shortDescription) {
        descriptionHTML = `<p>${resort.shortDescription}</p>`;
    } else {
        descriptionHTML = '<p>No description available.</p>';
    }
    
    descriptionEl.innerHTML = descriptionHTML;
  }
  
  function setupGallery(resort) {
    console.log('Setting up gallery...');
    
    const gallerySection = document.getElementById('gallery-section');
    if (!gallerySection) {
        console.warn('Gallery section element not found');
        return;
    }
    
    const photosArray = getResortPhotos(resort);
    
    if (photosArray.length === 0) {
        console.warn('No photos available for this resort');
        gallerySection.innerHTML = '<p class="no-photos">No photos available</p>';
        return;
    }
    
    console.log(`Displaying ${photosArray.length} photos`);
    
    // Process image URLs
    const processedPhotos = photosArray.map(photo => getImagePath(photo));
    console.log('Processed photo URLs:', processedPhotos);
    
    gallerySection.innerHTML = `
        <div class="main-image">
            <img src="${processedPhotos[0]}" id="main-image" alt="${resort.title || 'Resort'} Main Image">
        </div>
        <div class="thumbnail-gallery">
            ${processedPhotos.map((photo, index) => `
                <img src="${photo}" 
                     class="thumbnail ${index === 0 ? 'active' : ''}" 
                     alt="${resort.title || 'Resort'} Thumbnail ${index + 1}"
                     onclick="updateMainImage(this.src)">
            `).join('')}
        </div>
    `;
    
    // Update photo count
    updateElementText('photo-count', 
        `${photosArray.length} ${photosArray.length === 1 ? 'photo' : 'photos'}`
    );
    
    // Initialize image modal functionality
    initImageModal(processedPhotos);
  }
  
  function displayAmenities(resort) {
    console.log('Displaying amenities...');
    
    const amenityIcons = document.getElementById('amenity-icons');
    if (!amenityIcons) return;
    
    amenityIcons.innerHTML = '';
    
    if (Array.isArray(resort.amenities) && resort.amenities.length > 0) {
        console.log(`Displaying ${resort.amenities.length} amenities`);
        
        resort.amenities.forEach(amenity => {
            if (!amenity) return;
            
            const div = document.createElement('div');
            div.className = 'amenity';
            div.innerHTML = `<span>${amenity}</span>`;
            amenityIcons.appendChild(div);
        });
    } else {
        console.warn('No amenities listed for this resort');
        amenityIcons.innerHTML = '<p class="no-amenities">No amenities listed</p>';
    }
  }
  
  function setupLocationLinks(resort) {
    console.log('Setting up location links...');
    
    const mapLink = document.getElementById('map-link');
    const vlogLink = document.getElementById('vlog-link');
    
    if (mapLink) {
        if (resort.mapLink) {
            console.log('Map link available:', resort.mapLink);
            mapLink.href = resort.mapLink;
            mapLink.style.display = 'inline-block';
        } else {
            console.warn('No map link available');
            mapLink.style.display = 'none';
        }
    }
    
    if (vlogLink) {
        if (resort.VlogLink) {
            console.log('Vlog link available:', resort.VlogLink);
            vlogLink.href = resort.VlogLink;
            vlogLink.style.display = 'inline-block';
        } else {
            console.warn('No vlog link available');
            vlogLink.style.display = 'none';
        }
    }
  }
  
  function setupBookingButton(resortId) {
    console.log('Setting up booking button...');
    
    const bookNowButton = document.getElementById('book-now');
    if (bookNowButton) {
        bookNowButton.addEventListener('click', () => {
            console.log('Booking button clicked, redirecting...');
            window.location.href = `booking.html?id=${encodeURIComponent(resortId)}`;
        });
    } else {
        console.warn('Booking button element not found');
    }
  }
  
  // Helper Functions
  function getMainPhoto(resort) {
    return resort.imgSrc || 
          (Array.isArray(resort.photos) && resort.photos[0]) || 
          null;
  }
  
  function getResortPhotos(resort) {
    if (Array.isArray(resort.photos) && resort.photos.length > 0) {
        return resort.photos.filter(photo => photo && photo.trim() !== '');
    }
    return resort.imgSrc ? [resort.imgSrc] : [];
  }
  
  function getImagePath(imagePath) {
    if (!imagePath) return 'https://placehold.co/600x400/e9ecef/495057?text=No+Image+Available';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Remove any leading dots, slashes, and clean up the path
    const cleanPath = imagePath
        .replace(/^\.+\/+/, '')  // Remove leading ../ or ./
        .replace(/^\/+/, '')     // Remove leading slashes
        .replace(/\/+/g, '/')    // Clean up double slashes
        .replace(/^src\//, '')   // Remove leading src/
        .replace(/^images\//, '') // Remove leading images/
        .replace(/^uploads\//, ''); // Remove leading uploads/
    
    // Return the full URL to the backend server
    return `http://localhost:5000/uploads/${cleanPath}`;
  }
  
  function showErrorUI(title, message, linkHref, linkText) {
    const container = document.querySelector('.resort-detail-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <h2>${title}</h2>
            <p>${message}</p>
            <a href="${linkHref}" class="error-link">${linkText}</a>
        </div>`;
  }
  
  // Image Modal Functionality
  function initImageModal(photosArray) {
    console.log('Initializing image modal...');
    
    const modal = document.getElementById('image-modal');
    const modalImg = document.querySelector('.modal-image');
    const closeBtn = document.querySelector('.close-modal');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    let currentImageIndex = 0;
    
    // Set up main image click
    const mainImage = document.getElementById('main-image');
    if (mainImage) {
        mainImage.addEventListener('click', () => {
            currentImageIndex = 0;
            openModal();
        });
    }
    
    // Set up thumbnail clicks
    document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            currentImageIndex = index;
            openModal();
        });
    });
    
    function openModal() {
        if (photosArray.length === 0) return;
        
        modal.style.display = 'flex';
        modalImg.src = photosArray[currentImageIndex];
        modalImg.alt = `Resort Image ${currentImageIndex + 1}`;
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    function navigate(direction) {
        currentImageIndex += direction;
        if (currentImageIndex < 0) currentImageIndex = photosArray.length - 1;
        if (currentImageIndex >= photosArray.length) currentImageIndex = 0;
        
        modalImg.src = photosArray[currentImageIndex];
        modalImg.alt = `Resort Image ${currentImageIndex + 1}`;
    }
    
    // Event listeners
    closeBtn.addEventListener('click', closeModal);
    prevBtn.addEventListener('click', () => navigate(-1));
    nextBtn.addEventListener('click', () => navigate(1));
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'flex') {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
        }
    });
  }
  
  // Global function for image updates
  window.updateMainImage = function(src) {
    const mainImage = document.getElementById('main-image');
    if (mainImage) {
        mainImage.src = src;
        
        // Update active thumbnail
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
            if (thumb.src === src) {
                thumb.classList.add('active');
            }
        });
    }
  };
  
  // Helper function to safely update text content
  function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    } else {
        console.warn(`Element with id '${elementId}' not found`);
    }
  }
  
  // Helper function to safely update element source
  function updateElementSrc(elementId, src) {
    const element = document.getElementById(elementId);
    if (element) {
        element.src = src;
    } else {
        console.warn(`Element with id '${elementId}' not found`);
    }
  }
  
  // Helper function to get proper YouTube embed URL
  function getYouTubeEmbedUrl(url) {
    if (!url) return '';

    try {
        // If it looks like a YouTube embed URL, use it directly
        if (url.includes('youtube.com/embed/')) {
             // Ensure it uses https and www
            return url.replace('http://', 'https://').replace('//m.', '//www.');
        }

        // Attempt to extract video ID from other YouTube URL formats as a fallback
        let videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];

        if (videoId) {
            // Construct the clean embed URL with desired parameters
            return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
        }
    } catch (error) {
        console.error('Error processing YouTube URL:', error);
    }

    return ''; // Return empty string for invalid or unhandled URLs
  }
  
  // Helper function to get proper Google Maps embed URL
  function getGoogleMapsEmbedUrl(url) {
    if (!url) return '';
    
    try {
        // If it's already an embed URL, return as is
        if (url.includes('google.com/maps/embed')) return url;
        
        // Handle Google Maps share URLs
        if (url.includes('google.com/maps')) {
            // Extract the place ID or coordinates
            const placeMatch = url.match(/place\/([^\/]+)/);
            const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            
            if (placeMatch) {
                return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${placeMatch[1]}`;
            } else if (coordMatch) {
                return `https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${coordMatch[1]},${coordMatch[2]}&zoom=15`;
            }
        }
        
        // If it's a custom embed URL (like from the resort database), use it as is
        return url;
    } catch (error) {
        console.error('Error parsing Google Maps URL:', error);
    }
    
    return '';
  }
  
  // Update video section
  function updateVideoSection(resort) {
    const videoContainer = document.getElementById('resort-video');
    if (!videoContainer) return;
    
    const embedUrl = getYouTubeEmbedUrl(resort.vlogLink);
    if (embedUrl) {
        videoContainer.src = embedUrl;
        videoContainer.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        videoContainer.setAttribute('allowfullscreen', '');
        videoContainer.closest('.video-section').style.display = 'block';
    } else {
        videoContainer.closest('.video-section').style.display = 'none';
    }
  }
  
  // Update map section
  function updateMapSection(resort) {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;
    
    const embedUrl = getGoogleMapsEmbedUrl(resort.mapLink);
    if (embedUrl) {
        mapContainer.innerHTML = `
            <iframe 
                src="${embedUrl}" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade"
                allow="fullscreen">
            </iframe>`;
        mapContainer.closest('.location-section').style.display = 'block';
    } else {
        mapContainer.closest('.location-section').style.display = 'none';
    }
  }
  
  // Helper function to check if required DOM elements exist
  function checkRequiredElements() {
    const requiredElements = [
        'resort-title',
        'resort-preview-img',
        'resort-description',
        'resort-header-rating',
        'resort-name',
        'resort-location',
        'resort-price',
        'resort-rating',
        'gallery-section',
        'resort-video',
        'map-container'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Missing required DOM elements:', missingElements);
        showErrorUI(
            'Page Error',
            'Some required page elements are missing. Please refresh the page or contact support.',
            'search.html',
            'Back to Search'
        );
        return false;
    }
    
    return true;
  }