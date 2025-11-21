// add-package.js
document.getElementById('packageForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    const statusMsg = document.getElementById('statusMsg');
  
    try {
      const response = await fetch('http://localhost:5000/api/packages', {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        statusMsg.textContent = result.msg || 'Failed to add package';
        return;
      }
  
      statusMsg.style.color = 'green';
      statusMsg.textContent = 'Package added successfully!';
      e.target.reset();
    } catch (error) {
      console.error('Error adding package:', error);
      statusMsg.textContent = 'Server error, try again later.';
    }
  });
  