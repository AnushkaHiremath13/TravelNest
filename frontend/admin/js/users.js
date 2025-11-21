// Constants
const BASE_URL = 'http://localhost:5000';

// DOM Elements
const usersList = document.getElementById('usersList');
const searchInput = document.getElementById('searchUser');
const searchBtn = document.getElementById('searchBtn');
const deleteModal = document.getElementById('deleteModal');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');

let currentUserId = null;
let users = [];

// Helper function to get headers with authorization
function getHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'adminlogin.html';
        return null;
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
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

// Fetch and display users
async function fetchAndDisplayUsers() {
    try {
        if (!checkAuth()) return;

        const headers = getHeaders();
        if (!headers) return;

        const response = await fetch(`${BASE_URL}/api/admin/users`, {
            method: 'GET',
            headers,
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                window.location.href = 'adminlogin.html';
                return;
            }
            throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        users = data;
        displayUsers(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to load users. Please try again.');
    }
}

// Display users
function displayUsers(usersToDisplay = users) {
    usersList.innerHTML = '';
    usersToDisplay.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user._id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>${user.bookings?.length || 0}</td>
            <td><span class="role-badge ${user.role.toLowerCase()}">${user.role}</span></td>
            <td><span class="status ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>
                <button class="action-btn view-btn" data-id="${user._id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit-btn" data-id="${user._id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${user._id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        usersList.appendChild(row);
    });
}

// Search functionality
function searchUsers() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm)
    );
    displayUsers(filteredUsers);
}

// Event Listeners
searchBtn.addEventListener('click', searchUsers);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchUsers();
    }
});

// Delete functionality
function showDeleteModal(userId) {
    currentUserId = userId;
    deleteModal.style.display = 'flex';
}

function hideDeleteModal() {
    deleteModal.style.display = 'none';
    currentUserId = null;
}

async function deleteUser() {
    if (!currentUserId) return;

    try {
        const headers = getHeaders();
        if (!headers) return;

        const response = await fetch(`${BASE_URL}/api/admin/users/${currentUserId}`, {
            method: 'DELETE',
            headers,
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                window.location.href = 'adminlogin.html';
                return;
            }
            throw new Error('Failed to delete user');
        }

        users = users.filter(user => user._id !== currentUserId);
        displayUsers();
        hideDeleteModal();
        alert('User deleted successfully');
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
    }
}

// Event delegation for action buttons
usersList.addEventListener('click', (e) => {
    const target = e.target.closest('button');
    if (!target) return;

    const userId = target.dataset.id;
    if (!userId) return;

    if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
        showDeleteModal(userId);
    } else if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
        // Handle edit action
        console.log(`Editing user with ID: ${userId}`);
    } else if (target.classList.contains('view-btn') || target.closest('.view-btn')) {
        // Handle view action
        console.log(`Viewing user with ID: ${userId}`);
    }
});

confirmDeleteBtn.addEventListener('click', deleteUser);
cancelDeleteBtn.addEventListener('click', hideDeleteModal);

// Close modal when clicking outside
deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
        hideDeleteModal();
    }
});

// Initial fetch and display
fetchAndDisplayUsers(); 