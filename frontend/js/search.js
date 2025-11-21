document.addEventListener('DOMContentLoaded', function () {
  let resorts = [];
  const BASE_URL = 'http://localhost:5000';

  // 📦 Fetch resorts from backend API using optional filters
  async function fetchResorts(query = {}) {
    let url = `${BASE_URL}/api/resorts/search`;
    const params = new URLSearchParams(query).toString();
    if (params) url += `?${params}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch resorts');
      resorts = await response.json();
      displayResorts(resorts); // show resorts on the page
    } catch (error) {
      document.getElementById('results').innerHTML = '<div class="no-results">Error fetching resorts.</div>';
      document.getElementById('results-count').textContent = '0 results found';
    }
  }

  // 🖼️ Dynamically create and show resort cards
  function displayResorts(data) {
    const resultsContainer = document.getElementById('results');
    const resultsCount = document.getElementById('results-count');
    resultsContainer.innerHTML = '';

    if (!data || data.length === 0) {
      resultsContainer.innerHTML = '<div class="no-results">No resorts match your search. Try different filters!</div>';
      resultsCount.textContent = '0 results found';
      return;
    }

    data.forEach((resort) => {
      // 🔗 Wrap resort card inside a link to resort-detail page with ID
      const card = document.createElement('a');
      card.className = 'destination-card';
      card.href = `resort.html?id=${encodeURIComponent(resort._id)}`;

      // ⭐ Generate star rating
      const stars = Array(5).fill('').map((_, i) =>
        i < Math.floor(resort.rating) ? '<span class="star">★</span>' : '<span class="star">☆</span>'
      ).join('');

      // Format price to 2 decimal places
      const formattedPrice = parseFloat(resort.price).toFixed(2);

      // Get the correct image path
      let imagePath;
      if (resort.imgSrc) {
        // If it's a full URL, use it as is
        if (resort.imgSrc.startsWith('http')) {
          imagePath = resort.imgSrc;
        } else {
          // Otherwise, assume it's a local path relative to the frontend directory
          imagePath = `../src/${resort.imgSrc}`;
        }
      } else {
        imagePath = 'https://placehold.co/600x400/e9ecef/495057?text=No+Image+Available';
      }

      // 🧩 Fill in resort card content
      card.innerHTML = `
        <div class="destination-image">
          <img src="${imagePath}" alt="${resort.title}" onerror="this.src='https://placehold.co/600x400/e9ecef/495057?text=No+Image+Available'">
          <span class="destination-type">Resort</span>
        </div>
        <div class="card-info">
          <h3>${resort.title}</h3>
          <div class="destination-location">
            <span class="location-icon">📍</span> ${resort.location}
          </div>
          <p class="destination-description">${resort.shortDescription || ''}</p>
          <div class="card-details">
            <div class="rating">
              <div class="stars">${stars}</div>
              <span>${resort.rating}</span>
            </div>
            <div class="amenities">${(resort.amenities || []).slice(0, 3).join(', ')}${resort.amenities?.length > 3 ? '...' : ''}</div>
          </div>
          <div class="destination-footer">
            <div class="destination-price">₹${formattedPrice} <span class="price-per-night">/ night</span></div>
            <button class="book-now-btn" data-id="${resort._id}">View Resort</button>
          </div>
        </div>
      `;
      resultsContainer.appendChild(card);
    });

    // 🔢 Update count of results shown
    resultsCount.textContent = `${data.length} destinations found`;

    // ▶️ Handle "View Resort" button click to go to detail page
    document.querySelectorAll('.book-now-btn').forEach(btn => {
      btn.addEventListener('click', function (event) {
        event.stopPropagation(); // prevent anchor tag click event
        const resortId = this.dataset.id;
        if (resortId) {
          window.location.href = `resort.html?id=${encodeURIComponent(resortId)}`;
        }
      });
    });
  }

  // 🎛️ Apply search filters (destination + rating)
  function applyFilters() {
    const destinationValue = document.getElementById('destination').value.trim();
    const selectedRating = document.querySelector('.chip-filter[data-filter="rating"].selected')?.dataset.value;

    const query = {};
    if (destinationValue) query.destination = destinationValue;
    if (selectedRating) query.rating = selectedRating;

    fetchResorts(query); // fetch resorts matching filters
  }

  // 🔍 Autocomplete destination field (currently basic, can be improved)
  const destinationInput = document.getElementById('destination');
  const suggestionsList = document.getElementById('destination-suggestions');

  destinationInput.addEventListener('input', function () {
    if (this.value.length < 2) {
      suggestionsList.style.display = 'none';
      return;
    }
    suggestionsList.style.display = 'none'; // you can enhance this to show matching suggestions
  });

  // ⛔ Hide suggestions when clicking outside
  document.addEventListener('click', function (event) {
    if (!destinationInput.contains(event.target) && !suggestionsList.contains(event.target)) {
      suggestionsList.style.display = 'none';
    }
  });

  // 🔎 Trigger search when form is submitted
  document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();
    applyFilters();
  });

  // 🟦 Toggle rating filter chip selection
  document.querySelectorAll('.chip-filter').forEach(chip => {
    chip.addEventListener('click', function () {
      if (this.dataset.filter === 'rating') {
        document.querySelectorAll('.chip-filter[data-filter="rating"]').forEach(c => c.classList.remove('selected'));
      }
      this.classList.toggle('selected');
    });
  });

  // 💸 Update price range label
  document.getElementById('price-range').addEventListener('input', function () {
    document.getElementById('price-display').textContent = `₹${this.value}`;
  });

  // 🎛️ Toggle filter panel visibility (for mobile view)
  document.getElementById('filter-toggle').addEventListener('click', function () {
    document.getElementById('filter-panel').classList.toggle('active');
  });

  // 👥 Guest and room selector dropdown
  const guestsDropdownToggle = document.getElementById('guests-dropdown-toggle');
  const guestsDropdown = document.getElementById('guests-dropdown');
  const applyGuestsButton = document.getElementById('apply-guests');
  const guestsDisplay = document.getElementById('guests-display');
  const counts = { adults: 2, children: 0, rooms: 1 };

  guestsDropdownToggle?.addEventListener('click', function (event) {
    guestsDropdown.classList.toggle('show');
    event.stopPropagation();
  });

  // ➕➖ Increase/decrease guest/room counts
  document.querySelectorAll('.qty-btn').forEach(button => {
    button.addEventListener('click', function () {
      const target = this.dataset.target;
      if (this.classList.contains('plus')) counts[target]++;
      else if (this.classList.contains('minus') && counts[target] > 0) counts[target]--;
      document.getElementById(`${target}-count`).textContent = counts[target];
    });
  });

  // ✅ Apply guests selection and update UI
  applyGuestsButton?.addEventListener('click', function () {
    const totalGuests = counts.adults + counts.children;
    guestsDisplay.textContent = `${totalGuests} Guests, ${counts.rooms} Room${counts.rooms > 1 ? 's' : ''}`;
    guestsDropdown.classList.remove('show');
  });

  // 🧹 Close guests dropdown when clicking outside
  document.addEventListener('click', function (event) {
    if (!guestsDropdown.contains(event.target) && !guestsDropdownToggle.contains(event.target)) {
      guestsDropdown.classList.remove('show');
    }
  });

  // 🚀 Initial load of all resorts
  fetchResorts();

  // 👤 Handle Sign In / Logout button display
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const signinBtn = document.getElementById('signin-btn');
  const logoutBtn = document.getElementById('logout-btn');

  if (signinBtn && logoutBtn) {
    signinBtn.style.display = isLoggedIn ? 'none' : 'inline-block';
    logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';

    signinBtn.addEventListener('click', () => {
      window.location.href = '/frontend/html/signup.html';
    });

    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('isLoggedIn');
      window.location.reload();
    });
  }

  // 🍔 Hamburger menu logic for responsive navbar
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });

    // 📱 Dropdown menu behavior on mobile
    document.querySelectorAll('.nav-item').forEach(item => {
      const link = item.querySelector('a');
      const dropdown = item.querySelector('.dropdown-menu');
      if (dropdown && link) {
        link.addEventListener('click', function (e) {
          if (window.innerWidth <= 768) {
            e.preventDefault();
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
          }
        });
      }
    });
  }

  // 🧭 Scroll effect for sticky navbar background
  window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });

  // 🖥️ Reset dropdowns and nav on resize (for desktop mode)
  window.addEventListener('resize', function () {
    if (window.innerWidth > 767) {
      guestsDropdown?.classList.remove('show');
      navLinks?.classList.remove('active');
      hamburger?.classList.remove('active');
    }
  });

  // Profile dropdown functionality
  const profileDropdown = document.querySelector('.profile-dropdown');
  const logoutLink = document.getElementById('logout-link');

  if (signinBtn && profileDropdown) {
    if (isLoggedIn) {
      signinBtn.style.display = 'none';
      profileDropdown.style.display = 'block';
    } else {
      signinBtn.style.display = 'inline-block';
      profileDropdown.style.display = 'none';
    }

    // Sign in button click handler
    signinBtn.addEventListener('click', () => {
      window.location.href = '/frontend/html/signup.html';
    });

    // Logout link click handler
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('token');
      signinBtn.style.display = 'inline-block';
      profileDropdown.style.display = 'none';
      window.location.href = '/frontend/html/login.html';
    });
  }
});
