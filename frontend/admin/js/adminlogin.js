document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorDisplay = document.getElementById('error');

  try {
    const res = await fetch('http://localhost:5000/api/auth/admin/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorDisplay.textContent = data.message || 'Login failed';
      return;
    }

    // Store admin info and token
    localStorage.setItem('token', data.token);
    localStorage.setItem('adminUser', JSON.stringify(data.user));
    
    // Redirect to dashboard
    window.location.href = 'admindashboard.html';
  } catch (err) {
    console.error('Admin login error:', err);
    errorDisplay.textContent = 'Server error. Please try again later.';
  }
});