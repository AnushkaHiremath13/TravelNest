// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadDashboardData();
    setupLogout();
});

// Check if user is authenticated and is admin
function checkAuth() {
    const token = localStorage.getItem('token');
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    
    if (!token || adminUser.role !== 'admin') {
        window.location.href = 'adminlogin.html';
        return false;
    }
    return true;
}

// Load all dashboard data
async function loadDashboardData() {
    try {
        await Promise.all([
            fetchDashboardStats(),
            fetchPopularResorts()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Failed to load dashboard data. Please try again later.');
    }
}

// Fetch dashboard stats
async function fetchDashboardStats() {
    try {
        const token = localStorage.getItem('token');
        console.log('Fetching dashboard stats with token:', token);
        
        const response = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Dashboard stats response status:', response.status);
        
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }

        const data = await response.json();
        console.log('Dashboard stats data:', data);
        
        // Update UI with stats
        document.getElementById('totalResorts').textContent = data.totalResorts || 0;
        document.getElementById('totalUsers').textContent = data.totalUsers || 0;
        document.getElementById('avgRating').textContent = data.averageRating?.toFixed(1) || '0.0';

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
}

// Fetch popular resorts
async function fetchPopularResorts() {
    try {
        const token = localStorage.getItem('token');
        console.log('Fetching popular resorts with token:', token);
        
        const response = await fetch('http://localhost:5000/api/admin/resorts/popular', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Popular resorts response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error('Failed to fetch popular resorts');
        }

        const resorts = await response.json();
        console.log('Popular resorts data:', resorts);
        displayPopularResorts(resorts);

    } catch (error) {
        console.error('Error fetching popular resorts:', error);
        throw error;
    }
}

// Display popular resorts in the UI
function displayPopularResorts(resorts) {
    const popularResortsContainer = document.getElementById('popularResorts');
    
    if (!resorts || resorts.length === 0) {
        popularResortsContainer.innerHTML = '<p>No resorts found</p>';
        return;
    }

    popularResortsContainer.innerHTML = resorts.map(resort => {
        // Ensure rating is a number and handle undefined/null cases
        const rating = typeof resort.rating === 'number' ? resort.rating : 0;
        
        // Standardize image path to use backend server
        const imgPath = resort.imgSrc ? 
            (resort.imgSrc.startsWith('http') ? resort.imgSrc :
            `http://localhost:5000/${resort.imgSrc.startsWith('/') ? resort.imgSrc.slice(1) : resort.imgSrc}`) : 
            'https://placehold.co/600x400/e9ecef/495057?text=No+Image+Available';
        
        return `
            <div class="resort-card">
                <img src="${imgPath}" 
                     alt="${resort.title}"
                     onerror="this.src='https://placehold.co/600x400/e9ecef/495057?text=No+Image+Available'">
                <h3>${resort.title}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${resort.location}</p>
                <p><i class="fas fa-rupee-sign"></i> ${resort.price}/night</p>
                <p><i class="fas fa-star"></i> ${rating.toFixed(1)}</p>
            </div>
        `;
    }).join('');
}

// Setup logout functionality
function setupLogout() {
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
        window.location.href = 'adminlogin.html';
    });
} 