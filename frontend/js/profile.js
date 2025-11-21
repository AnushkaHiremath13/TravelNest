// API endpoints
const API_URL = '/api';
const ENDPOINTS = {
  PROFILE: `${API_URL}/users/profile`,
  PROFILE_PICTURE: `${API_URL}/users/profile/picture`,
  TRAVELERS: `${API_URL}/users/profile/travelers`,
  DOCUMENTS: `${API_URL}/users/profile/documents`,
  PREFERENCES: `${API_URL}/users/profile/preferences`,
  STATS: `${API_URL}/users/profile/stats`
};

// Utility functions
const getAuthToken = () => localStorage.getItem('token');

const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await fetch(endpoint, { ...defaultOptions, ...options });
    if (response.status === 401) {
      window.location.href = '/login.html';
      return;
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API request failed');
    return data;
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  }
};

document.addEventListener('DOMContentLoaded', async function() {
  // Initialize profile data
  let profileData = null;

  // DOM Elements
  const fileInput = document.getElementById('fileInput');
  const profileImage = document.getElementById('profileImage');
  const editButtons = document.querySelectorAll('.edit-btn');
  const modal = document.getElementById('editProfileModal');
  const closeModal = document.querySelector('.close-modal');
  const cancelBtn = document.querySelector('.cancel-btn');
  const editProfileForm = document.getElementById('editProfileForm');
  const addDocButtons = document.querySelectorAll('.add-doc');
  const completeProfileBtn = document.querySelector('.complete-profile');
  const userWelcome = document.querySelector('.user-welcome h2');
  const walletBalance = document.querySelector('.wallet span');
  const profileStats = document.querySelectorAll('.stat-number');

  // Fetch and initialize profile data
  async function initializePage() {
    try {
      profileData = await apiFetch(ENDPOINTS.PROFILE);
      
      // Update profile image
      if (profileData.profileImage) {
        profileImage.src = `/uploads/${profileData.profileImage}`;
        document.querySelector('.user-profile img').src = `/uploads/${profileData.profileImage}`;
      }

      // Update welcome message
      userWelcome.textContent = `Hi, ${profileData.name.split(' ')[0]}!`;

      // Update wallet balance
      walletBalance.textContent = `₹${profileData.stats.rewardPoints || 0}`;

      // Update personal information
      updatePersonalInfo();

      // Update documents status
      updateDocumentsStatus();

      // Update preferences
      updatePreferences();

      // Update travelers
      updateTravelers();

      // Update stats
      updateStats();

      // Calculate and update profile completion
      updateCompletionPercentage();
    } catch (error) {
      console.error('Failed to initialize profile:', error);
    }
  }

  // Update Personal Information
  function updatePersonalInfo() {
    const infoItems = document.querySelectorAll('.info-item');
    infoItems.forEach(item => {
      const label = item.querySelector('.label').textContent.toLowerCase();
      const value = item.querySelector('.value');
      
      switch(label) {
        case 'full name':
          value.textContent = profileData.name;
          break;
        case 'mobile number':
          value.textContent = profileData.phone;
          break;
        case 'email id':
          value.textContent = profileData.email;
          break;
        case 'date of birth':
          value.textContent = profileData.dateOfBirth ? formatDate(profileData.dateOfBirth) : 'Not set';
          break;
      }
    });
  }

  // Update Documents Status
  function updateDocumentsStatus() {
    if (!profileData.documents) return;

    Object.entries(profileData.documents).forEach(([doc, details]) => {
      const docElement = document.querySelector(`.document-item:contains('${formatDocumentName(doc)}')`);
      if (docElement) {
        const button = docElement.querySelector('.add-doc');
        if (details && details.number) {
          button.textContent = 'Update';
          button.classList.add('uploaded');
          addDocumentStatus(docElement, details);
        }
      }
    });
  }

  // Update Preferences
  function updatePreferences() {
    if (!profileData.preferences) return;

    Object.entries(profileData.preferences).forEach(([category, prefs]) => {
      const prefSection = document.querySelector(`.preferences-section:contains('${formatPreferenceName(category)}')`);
      if (prefSection && prefs.length > 0) {
        const tagsContainer = prefSection.querySelector('.preference-tags');
        tagsContainer.innerHTML = prefs.map(pref => `
          <span class="pref-tag">${pref}</span>
        `).join('');
      }
    });
  }

  // Update Travelers
  function updateTravelers() {
    if (!profileData.savedTravelers) return;

    const travelersList = document.querySelector('.travelers-list');
    travelersList.innerHTML = profileData.savedTravelers.map(traveler => `
      <div class="traveler-item" data-id="${traveler._id}">
        <div class="traveler-info">
          <i class="fas fa-user-circle"></i>
          <div>
            <h4>${traveler.name}</h4>
            <span>${traveler.type} • ${traveler.relation}</span>
          </div>
        </div>
        <button class="edit-traveler"><i class="fas fa-edit"></i></button>
      </div>
    `).join('');

    attachTravelerEventListeners();
  }

  // Update Stats
  function updateStats() {
    if (!profileData.stats) return;

    const statsMap = {
      0: profileData.stats.trips || 0,
      1: profileData.stats.reviews || 0,
      2: profileData.stats.wishlists || 0,
      3: profileData.stats.rewardPoints || 0
    };

    profileStats.forEach((stat, index) => {
      stat.textContent = statsMap[index];
    });
  }

  // Profile Image Upload
  fileInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (file && validateImage(file)) {
      const formData = new FormData();
      formData.append('profileImage', file);

      try {
        const response = await fetch(ENDPOINTS.PROFILE_PICTURE, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        profileImage.src = `/uploads/${data.profileImage}`;
        document.querySelector('.user-profile img').src = `/uploads/${data.profileImage}`;
        showToast('Profile picture updated successfully');
      } catch (error) {
        showToast(error.message, 'error');
      }
    }
  });

  // Form Submission
  editProfileForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const updates = Object.fromEntries(formData.entries());

    try {
      const response = await apiFetch(ENDPOINTS.PROFILE, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      profileData = response;
      updatePersonalInfo();
      closeModalHandler();
      showToast('Profile updated successfully');
    } catch (error) {
      showToast('Failed to update profile', 'error');
    }
  });

  // Document Upload Handling
  addDocButtons.forEach(button => {
    button.addEventListener('click', async function() {
      const docType = this.parentElement.querySelector('h4').textContent.toLowerCase();
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.jpg,.png,.jpeg';
      
      input.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (file && validateDocument(file)) {
          const formData = new FormData();
          formData.append('document', file);
          formData.append('type', docType);

          try {
            const response = await apiFetch(ENDPOINTS.DOCUMENTS, {
              method: 'PUT',
              body: JSON.stringify({
                [docType]: {
                  number: 'TEMP-' + Date.now(), // This should be replaced with actual document number
                  uploadDate: new Date().toISOString(),
                  verified: false
                }
              })
            });

            profileData.documents = response.documents;
            updateDocumentsStatus();
            showToast(`${docType} uploaded successfully`);
          } catch (error) {
            showToast('Failed to upload document', 'error');
          }
        }
      });
      
      input.click();
    });
  });

  // Utility Functions
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatDocumentName(doc) {
    return doc.replace(/([A-Z])/g, ' $1').trim();
  }

  function formatPreferenceName(pref) {
    return pref.charAt(0).toUpperCase() + pref.slice(1);
  }

  function validateImage(file) {
    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      showToast('Please upload a JPG or PNG image', 'error');
      return false;
    }
    
    if (file.size > maxSize) {
      showToast('Image size should be less than 5MB', 'error');
      return false;
    }
    
    return true;
  }

  function validateDocument(file) {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      showToast('Please upload a PDF, JPG or PNG file', 'error');
      return false;
    }
    
    if (file.size > maxSize) {
      showToast('Document size should be less than 10MB', 'error');
      return false;
    }
    
    return true;
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function calculateProfileCompletion() {
    if (!profileData) return 0;

    const sections = {
      personal: ['name', 'email', 'phone', 'dateOfBirth', 'gender', 'nationality'],
      documents: ['passport', 'governmentId', 'visa'],
      preferences: ['seat', 'meal', 'hotel', 'destinations', 'travelStyle']
    };

    let totalFields = 0;
    let completedFields = 0;

    Object.entries(sections).forEach(([section, fields]) => {
      fields.forEach(field => {
        totalFields++;
        if (section === 'preferences') {
          if (profileData[section]?.[field]?.length > 0) completedFields++;
        } else if (section === 'documents') {
          if (profileData[section]?.[field]?.number) completedFields++;
        } else {
          if (profileData[field]) completedFields++;
        }
      });
    });

    return Math.round((completedFields / totalFields) * 100);
  }

  function updateCompletionPercentage() {
    const percentage = calculateProfileCompletion();
    const progressBar = document.querySelector('.progress');
    const percentageText = document.querySelector('.completion-header span');
    
    progressBar.style.width = `${percentage}%`;
    percentageText.textContent = `${percentage}% Complete`;
  }

  // Event Handlers
  function closeModalHandler() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  function attachTravelerEventListeners() {
    document.querySelectorAll('.edit-traveler').forEach(button => {
      button.addEventListener('click', function() {
        const travelerId = this.closest('.traveler-item').dataset.id;
        editTraveler(travelerId);
      });
    });
  }

  // Event Listeners for Modal
  editButtons.forEach(button => {
    button.addEventListener('click', () => {
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    });
  });

  closeModal.addEventListener('click', closeModalHandler);
  cancelBtn.addEventListener('click', closeModalHandler);

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModalHandler();
    }
  });

  // Initialize the page
  initializePage();
});

document.addEventListener('DOMContentLoaded', function() {
    const editButton = document.getElementById('editButton');
    const addLinks = document.querySelectorAll('.info-row a');
  
    // When clicking the Edit button
    editButton.addEventListener('click', function() {
      window.location.href = 'edit-profile.html'; // Redirect to Edit Page
    });
  
    // When clicking any +Add links
    addLinks.forEach(function(link) {
      link.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default jump
        window.location.href = 'edit-profile.html'; // Redirect to Edit Page
      });
    });
  });

/**Edit profile module */
document.addEventListener('DOMContentLoaded', function() {
  const editButton = document.querySelector('.edit-button');
  const modal = document.getElementById('editProfileModal');
  const cancelButton = document.getElementById('cancelButton');
  const form = document.getElementById('editProfileForm');

  // Open Modal
  editButton.addEventListener('click', function() {
    modal.style.display = 'block';
  });

  // Close Modal
  cancelButton.addEventListener('click', function() {
    modal.style.display = 'none';
  });

  // Close modal when clicking outside content
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Save form
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Profile Updated!');
    modal.style.display = 'none';
  });
});

// Function to show a small success popup
function showSuccessMessage(message) {
  const popup = document.createElement('div');
  popup.textContent = message;
  popup.style.position = 'fixed';
  popup.style.top = '20px';
  popup.style.right = '20px';
  popup.style.backgroundColor = '#28a745';
  popup.style.color = 'white';
  popup.style.padding = '10px 20px';
  popup.style.borderRadius = '10px';
  popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
  popup.style.zIndex = '1000';
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 2000);
}

// DOM Elements
const fileInput = document.getElementById('fileInput');
const profileImage = document.getElementById('profileImage');
const editProfileModal = document.getElementById('editProfileModal');
const editButton = document.querySelector('.edit-button');
const closeModalButton = document.querySelector('.close-modal');
const cancelButton = document.querySelector('.cancel-btn');
const editProfileForm = document.getElementById('editProfileForm');
const addTagButtons = document.querySelectorAll('.add-tag');
const tagInputs = document.querySelectorAll('.tag-input input');
const currentTags = document.querySelectorAll('.current-tags');

// Profile image upload
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            profileImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Modal handling
function openModal() {
    editProfileModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    editProfileModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

editButton.addEventListener('click', openModal);
closeModalButton.addEventListener('click', closeModal);
cancelButton.addEventListener('click', closeModal);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === editProfileModal) {
        closeModal();
    }
});

// Form submission
editProfileForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    // For now, we'll just close the modal
    closeModal();
});

// Tag management
function createTag(text, container) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `${text}<i class="fas fa-times"></i>`;
    
    // Add delete functionality
    tag.querySelector('i').addEventListener('click', () => {
        tag.remove();
    });
    
    container.appendChild(tag);
}

// Add new tags
addTagButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        const input = tagInputs[index];
        const text = input.value.trim();
        
        if (text) {
            createTag(text, currentTags[index]);
            input.value = '';
        }
    });
    
    // Also allow adding tags with Enter key
    tagInputs[index].addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            button.click();
        }
    });
});

// Menu item selection
const menuItems = document.querySelectorAll('.menu li');
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});

// Notifications dropdown (can be expanded based on requirements)
const userMenu = document.querySelector('.user-menu');
userMenu.addEventListener('click', () => {
    // Add your user menu dropdown logic here
    console.log('User menu clicked');
});

// Insurance plan selection
const addInsuranceButtons = document.querySelectorAll('.add-insurance');
addInsuranceButtons.forEach(button => {
    button.addEventListener('click', function() {
        const currentText = this.textContent;
        if (currentText === 'Add Plan') {
            this.textContent = 'Remove Plan';
            this.style.background = 'var(--primary-color)';
            this.style.color = 'white';
        } else {
            this.textContent = 'Add Plan';
            this.style.background = 'transparent';
            this.style.color = 'var(--primary-color)';
        }
    });
});

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Initialize any tooltips or popovers (if needed)
function initTooltips() {
    // Add your tooltip initialization code here
}

// Handle responsive menu for mobile
const navLinks = document.querySelector('.nav-links');
const menuToggle = document.createElement('button');
menuToggle.className = 'menu-toggle';
menuToggle.innerHTML = '<i class="fas fa-bars"></i>';

// Add menu toggle for mobile view
if (window.innerWidth <= 768) {
    document.querySelector('.main-nav').insertBefore(menuToggle, navLinks);
    
    menuToggle.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initTooltips();
});
  