document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      // Remove the session key (e.g., 'loggedInUser' from localStorage)
      localStorage.removeItem('loggedInUser');
      // Or: localStorage.clear(); // clears everything

      // Optional: show a quick message or log
      console.log('User logged out.');

      // Redirect to login page
      window.location.href = 'login.html';
    });
  }
});
