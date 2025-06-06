document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const role = document.getElementById('regRole').value;

  const newUser = { email, password, role };

  try {
    const response = await fetch("https://0lwyushaoc.execute-api.ap-southeast-2.amazonaws.com/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Registration failed.");
    }

    alert("Registration successful! You can now log in.");
    window.location.href = "login.html";

  } catch (error) {
    alert("Error: " + error.message);
  }
});
