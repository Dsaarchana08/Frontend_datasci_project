document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const response = await fetch("https://6bu91ie6q7.execute-api.ap-southeast-2.amazonaws.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed.");
    }

    // Redirect based on role
    switch (data.role) {
      case 'Admission Team':
        window.location.href = 'overview.html';
        break;
      case 'Pathway Team':
        window.location.href = 'overview.html';
        break;
      case 'College Staff':
        window.location.href = 'upload.html';
        break;
      default:
        alert(`Unknown role: ${data.role}`);
    }
  } catch (error) {
    alert("Error: " + error.message);
  }
});
