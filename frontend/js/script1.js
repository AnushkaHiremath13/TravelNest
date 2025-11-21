// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
  } else {
      navbar.classList.remove('scrolled');
  }
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
  }
});

// Handle dropdown menus
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
  const link = item.querySelector('a');
  const dropdown = item.querySelector('.dropdown-menu');
  
  if (dropdown) {
      link.addEventListener('click', (e) => {
          if (window.innerWidth <= 768) {
              e.preventDefault();
              dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
          }
      });
  }
});

// Slider functionality
const sliderWrapper = document.querySelector('.slider-wrapper');
const prevBtn = document.querySelector('.slider-btn.prev');
const nextBtn = document.querySelector('.slider-btn.next');
const cards = document.querySelectorAll('.destination-card');
let currentIndex = 0;
let isAnimating = false;

function getCardsPerView() {
  const containerWidth = sliderWrapper.offsetWidth;
  const cardWidth = cards[0].offsetWidth;
  const gap = 20;
  return Math.floor(containerWidth / (cardWidth + gap));
}

function updateSlider() {
  if (isAnimating) return;
  isAnimating = true;

  const cardsPerView = getCardsPerView();
  const maxIndex = Math.max(0, cards.length - cardsPerView);
  currentIndex = Math.min(Math.max(0, currentIndex), maxIndex);

  const offset = currentIndex * (cards[0].offsetWidth + 20);
  sliderWrapper.style.transform = `translateX(-${offset}px)`;

  setTimeout(() => {
      isAnimating = false;
  }, 500);
}

function handleResize() {
  currentIndex = 0;
  updateSlider();
}

prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
      currentIndex--;
      updateSlider();
  }
});

nextBtn.addEventListener('click', () => {
  const cardsPerView = getCardsPerView();
  if (currentIndex < cards.length - cardsPerView) {
      currentIndex++;
      updateSlider();
  }
});

window.addEventListener('load', () => {
  updateSlider();
});
window.addEventListener('resize', () => {
  handleResize();
});

// Touch support
let touchStartX = 0;
let touchEndX = 0;

sliderWrapper.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

sliderWrapper.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const swipeDistance = touchEndX - touchStartX;
  if (Math.abs(swipeDistance) > 50) {
      if (swipeDistance > 0 && currentIndex > 0) {
          currentIndex--;
          updateSlider();
      } else if (swipeDistance < 0) {
          const cardsPerView = getCardsPerView();
          if (currentIndex < cards.length - cardsPerView) {
              currentIndex++;
              updateSlider();
          }
      }
  }
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
          target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
          });
      }
  });
});

// Scroll progress bar
const addScrollProgress = () => {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + '%';
  });
};
addScrollProgress();

// Scroll reveal effect
const scrollReveal = () => {
  const elements = document.querySelectorAll('.destination-card, .viewed-card, .offer-card');
  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('reveal');
              observer.unobserve(entry.target);
          }
      });
  }, {
      threshold: 0.1
  });

  elements.forEach(el => observer.observe(el));
};
scrollReveal();

// Recently Viewed functionality
const destinationCards = document.querySelectorAll('.destination-card');

destinationCards.forEach(card => {
  card.addEventListener('click', () => {
      const title = card.querySelector('h3').textContent;
      const description = card.querySelector('p').textContent;
      const rating = card.querySelector('.rating').textContent;
      const image = card.querySelector('img').getAttribute('src');

      const viewedResort = { title, description, rating, image };

      let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

      // Remove if already exists (to avoid duplicates)
      recentlyViewed = recentlyViewed.filter(item => item.title !== viewedResort.title);

      // Add to beginning
      recentlyViewed.unshift(viewedResort);

      // Limit to latest 5
      recentlyViewed = recentlyViewed.slice(0, 5);

      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));

      renderRecentlyViewed();
  });
});

function renderRecentlyViewed() {
  const container = document.querySelector('.viewed-container');
  container.innerHTML = '';

  const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

  if (recentlyViewed.length === 0) {
      container.innerHTML = `<p style="text-align: center; color: gray;">No resorts viewed yet.</p>`;
      return;
  }

  recentlyViewed.forEach(resort => {
      const card = document.createElement('div');
      card.className = 'viewed-card reveal';
      card.innerHTML = `
          <img src="/frontend${resort.image}" alt="${resort.title}">
          <div class="card-info">
              <h3>${resort.title}</h3>
              <p>${resort.description}</p>
              <div class="card-details">
                  <span class="rating">${resort.rating}</span>
                  <span class="amenities">Recently Viewed</span>
              </div>
          </div>
      `;
      container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', renderRecentlyViewed);

// Check authentication status
function checkAuth() {
    const token = localStorage.getItem('token');
    const signinBtn = document.getElementById('signin-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const navLinks = document.querySelector('.nav-links');

    if (token) {
        signinBtn.style.display = 'none';
        logoutBtn.style.display = 'none';
        
        // Add profile icon and dropdown if not exists
        if (!document.querySelector('.profile-dropdown')) {
            const profileDropdown = document.createElement('div');
            profileDropdown.className = 'profile-dropdown';
            profileDropdown.innerHTML = `
                <div class="profile-icon">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="dropdown-content">
                    <a href="/profile.html"><i class="fas fa-user"></i> My Profile</a>
                    <a href="#" id="logout-link"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            `;
            navLinks.appendChild(profileDropdown);

            // Add event listener for logout
            document.getElementById('logout-link').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('isLoggedIn');
                window.location.href = '/login.html';
            });
        }
    } else {
        signinBtn.style.display = 'block';
        
        // Remove profile dropdown if exists
        const profileDropdown = document.querySelector('.profile-dropdown');
        if (profileDropdown) {
            profileDropdown.remove();
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const signinBtn = document.getElementById('signin-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const getStartedBtn = document.getElementById('getstartedbtn');

    // Check authentication status on page load
    checkAuth();

    // Sign in button click handler
    signinBtn.addEventListener('click', function() {
        window.location.href = '/login.html';
    });

    // Logout button click handler
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('token');
        checkAuth();
        window.location.href = '/';
    });

    // Get started button click handler
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            const token = localStorage.getItem('token');
            if (token) {
                window.location.href = '/search.html';
            } else {
                window.location.href = '/login.html';
            }
        });
    }

    // Handle hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInside = navLinks.contains(event.target) || 
                            hamburger.contains(event.target);
        
        if (!isClickInside && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu after clicking a link
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
});

// Add styles for the profile dropdown
const profileStyles = document.createElement('style');
profileStyles.textContent = `
    .profile-dropdown {
        position: relative;
        margin-left: auto;
        cursor: pointer;
    }

    .profile-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #f0f0f0;
        transition: background-color 0.3s ease;
    }

    .profile-icon i {
        font-size: 1.5rem;
        color: #008cff;
    }

    .profile-icon:hover {
        background: #e0e0e0;
    }

    .dropdown-content {
        display: none;
        position: absolute;
        right: 0;
        top: 100%;
        background: white;
        min-width: 200px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        border-radius: 8px;
        padding: 8px 0;
        z-index: 1000;
    }

    .profile-dropdown:hover .dropdown-content {
        display: block;
    }

    .dropdown-content a {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 20px;
        color: #333;
        text-decoration: none;
        transition: background-color 0.3s ease;
    }

    .dropdown-content a:hover {
        background: #f5f5f5;
    }

    .dropdown-content i {
        font-size: 1.1rem;
        color: #008cff;
    }

    @media (max-width: 768px) {
        .profile-dropdown {
            margin: 10px auto;
        }
        
        .dropdown-content {
            position: static;
            box-shadow: none;
            background: transparent;
        }
        
        .dropdown-content a {
            justify-content: center;
            color: white;
        }
        
        .dropdown-content a:hover {
            background: rgba(255, 255, 255, 0.1);
        }
    }
`;
document.head.appendChild(profileStyles);

// Check authentication status when storage changes
window.addEventListener('storage', function(e) {
    if (e.key === 'token') {
        checkAuth();
    }
});
