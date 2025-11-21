// DOM Elements
const form = document.getElementById('loginForm');
const usernameInput = form.querySelector('input[type="text"]');
const passwordInput = document.getElementById('password');
const rememberCheckbox = form.querySelector('input[type="checkbox"]');
const loginBtn = form.querySelector('.login-btn');
const togglePassword = document.querySelector('.toggle-password');
const socialButtons = document.querySelectorAll('.social-login button');

// Form Data Storage
const formData = {
    username: '',
    password: '',
    remember: false
};

// Local Storage Keys
const STORAGE_KEYS = {
    USERNAME: 'travelNestUsername',
    REMEMBER: 'travelNestRemember'
};

// Social Login Configuration
const SOCIAL_CONFIG = {
    google: {
        clientId: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual Google Client ID
        redirectUri: 'http://localhost:3000/auth/google/callback',
        scope: 'email profile'
    },
    facebook: {
        appId: 'YOUR_FACEBOOK_APP_ID', // Replace with your actual Facebook App ID
        redirectUri: 'http://localhost:3000/auth/facebook/callback',
        scope: 'email,public_profile'
    }
};

// Initialize form with saved data
function initializeForm() {
    const savedUsername = localStorage.getItem(STORAGE_KEYS.USERNAME);
    const savedRemember = localStorage.getItem(STORAGE_KEYS.REMEMBER) === 'true';

    if (savedUsername && savedRemember) {
        usernameInput.value = savedUsername;
        rememberCheckbox.checked = savedRemember;
        formData.username = savedUsername;
        formData.remember = savedRemember;
    }
}

// Input Validation
function validateInput(input, type) {
    const feedback = input.parentElement.querySelector('.input-feedback');
    const value = input.value.trim();
    
    if (type === 'username') {
        if (value.length < 3) {
            showError(input, feedback, 'Username must be at least 3 characters');
            return false;
        }
    } else if (type === 'password') {
        if (value.length < 6) {
            showError(input, feedback, 'Password must be at least 6 characters');
            return false;
        }
    }
    
    clearError(input, feedback);
    return true;
}

function showError(input, feedback, message) {
    input.parentElement.classList.add('error');
    feedback.textContent = message;
    feedback.style.opacity = '1';
}

function clearError(input, feedback) {
    input.parentElement.classList.remove('error');
    feedback.style.opacity = '0';
}

// Form Submission
async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate inputs
    const isUsernameValid = validateInput(usernameInput, 'username');
    const isPasswordValid = validateInput(passwordInput, 'password');
    
    if (!isUsernameValid || !isPasswordValid) return;

    // Update form data
    formData.username = usernameInput.value.trim();
    formData.password = passwordInput.value;
    formData.remember = rememberCheckbox.checked;

    // Save to localStorage if remember is checked
    if (formData.remember) {
        localStorage.setItem(STORAGE_KEYS.USERNAME, formData.username);
        localStorage.setItem(STORAGE_KEYS.REMEMBER, 'true');
    } else {
        localStorage.removeItem(STORAGE_KEYS.USERNAME);
        localStorage.removeItem(STORAGE_KEYS.REMEMBER);
    }

    // Show loading state
    loginBtn.classList.add('loading');
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Handle successful login
        console.log('Login successful:', formData);
        // Redirect to dashboard or home page
        // window.location.href = '/dashboard';
        
    } catch (error) {
        console.error('Login failed:', error);
        showError(passwordInput, passwordInput.parentElement.querySelector('.input-feedback'), 'Invalid credentials');
    } finally {
        loginBtn.classList.remove('loading');
    }
}

// Social Login Handlers
async function handleGoogleLogin() {
    const googleBtn = document.querySelector('.google-btn');
    try {
        googleBtn.classList.add('loading');
        // In a real implementation, you would redirect to Google OAuth
        // window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${SOCIAL_CONFIG.google.clientId}&redirect_uri=${SOCIAL_CONFIG.google.redirectUri}&response_type=code&scope=${SOCIAL_CONFIG.google.scope}`;
        
        // Simulate API call for demo
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Google login successful');
        showSuccessMessage('Google login successful!');
    } catch (error) {
        console.error('Google login failed:', error);
        showErrorMessage('Google login failed. Please try again.');
    } finally {
        googleBtn.classList.remove('loading');
    }
}

async function handleFacebookLogin() {
    const facebookBtn = document.querySelector('.facebook-btn');
    try {
        facebookBtn.classList.add('loading');
        // In a real implementation, you would redirect to Facebook OAuth
        // window.location.href = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${SOCIAL_CONFIG.facebook.appId}&redirect_uri=${SOCIAL_CONFIG.facebook.redirectUri}&scope=${SOCIAL_CONFIG.facebook.scope}`;
        
        // Simulate API call for demo
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Facebook login successful');
        showSuccessMessage('Facebook login successful!');
    } catch (error) {
        console.error('Facebook login failed:', error);
        showErrorMessage('Facebook login failed. Please try again.');
    } finally {
        facebookBtn.classList.remove('loading');
    }
}

// Notification System
function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    showNotification(notification);
}

function showErrorMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    showNotification(notification);
}

function showNotification(notification) {
    const container = document.querySelector('.login-container');
    container.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Event Listeners
function setupEventListeners() {
    // Form submission
    form.addEventListener('submit', handleSubmit);

    // Input validation
    usernameInput.addEventListener('input', () => {
        validateInput(usernameInput, 'username');
    });

    passwordInput.addEventListener('input', () => {
        validateInput(passwordInput, 'password');
    });

    // Password visibility toggle
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Social login buttons
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('google-btn')) {
                handleGoogleLogin();
            } else if (this.classList.contains('facebook-btn')) {
                handleFacebookLogin();
            }
        });
    });

    // Remember me checkbox
    rememberCheckbox.addEventListener('change', function() {
        formData.remember = this.checked;
    });

    // Input focus effects
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    setupEventListeners();
}); 