document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const role = document.getElementById('regRole').value;
  
    const newUser = { email, password, role };
  
    // Fetch all users from localStorage or initialize
    let users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
  
    // Check if user already exists
    const exists = users.some(user => user.email === email);
    if (exists) {
      alert('User already exists. Please log in.');
      return;
    }
  
    // Add new user and store back
    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
  
    alert('Registration successful! You can now log in.');
    window.location.href = 'login.html';
  });
  