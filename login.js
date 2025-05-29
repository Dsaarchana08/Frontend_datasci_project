document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
  
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
  
    // Find matching user
    const matchedUser = users.find(user => user.email === email && user.password === password);
  
    if (!matchedUser) {
      alert('Invalid email or password.');
      return;
    }

    localStorage.setItem('loggedInUser', JSON.stringify(matchedUser));
  
    // Redirect based on role
    switch (matchedUser.role) {
      case 'Admission Team':
        window.location.href = 'overview.html';
        break;
      case 'Pathway Team':
        window.location.href = 'pathway.html';
        break;
      case 'College Staff':
        window.location.href = 'upload.html';
        break;
      default:
        alert(`Unknown role: ${matchedUser.role}`);
    }
  });
  