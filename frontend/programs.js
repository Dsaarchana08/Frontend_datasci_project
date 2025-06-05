document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchProgramForm');
  const addToggleBtn = document.getElementById('addProgramToggleBtn');
  const programForm = document.getElementById('programForm');
  const programResult = document.getElementById('programResult');
  const tableBody = document.getElementById('programTableBody');
  const deletePopup = document.getElementById('deleteConfirmPopup');
  const overlay = document.getElementById('overlay');
  const deleteBtn = document.getElementById('deleteProgramBtn');  // Delete button outside table

  let lastSearch = {};

  // Hide and disable delete button initially
  deleteBtn.style.display = 'none';
  deleteBtn.disabled = true;

  // Toggle add form visibility
  addToggleBtn.addEventListener('click', () => {
    programForm.classList.toggle('hidden');
  });

  // Search form submit handler
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const program_code = document.getElementById('searchProgramCode').value.trim();
    const plan_code = document.getElementById('searchPlanCode').value.trim();

    try {
      const res = await fetch(`https://z0jhqewof9.execute-api.ap-southeast-2.amazonaws.com/programs?program_code=${program_code}&plan_code=${plan_code}`);
      if (res.ok) {
        const data = await res.json();
        lastSearch = { program_code, plan_code };

        // Populate table with program data (no delete button here)
        tableBody.innerHTML = `
          <tr>
            <td>${data.program_code}</td>
            <td>${data.plan_code}</td>
            <td>${data.program_name}</td>
            <td>${data.plan_name}</td>
            <td>${data.cricos_code || ''}</td>
            <td>${data.duration || ''}</td>
            <td>${data.aqf_level || ''}</td>
            <td>${data.school || ''}</td>
            <td>${data.college || ''}</td>
            <td>${data.contact_name || ''}</td>
            <td>${data.contact_email || ''}</td>
            <td>${data.position || ''}</td>
          </tr>
        `;

        programResult.classList.remove('hidden');
        deleteBtn.style.display = 'inline-block';
        deleteBtn.disabled = false;

      } else if (res.status === 404) {
        alert('No matching program found.');
        programResult.classList.add('hidden');
        deleteBtn.style.display = 'none';
        deleteBtn.disabled = true;
        lastSearch = {};
      } else {
        alert('Unexpected error during search.');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  });

  // Create program form submit handler
  programForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const body = {
      program_code: document.getElementById('program_code').value.trim(),
      plan_code: document.getElementById('plan_code').value.trim(),
      program_name: document.getElementById('program_name').value.trim(),
      plan_name: document.getElementById('plan_name').value.trim(),
      cricos_code: document.getElementById('cricos_code').value.trim(),
      duration: document.getElementById('duration').value.trim(),
      aqf_level: parseInt(document.getElementById('aqf_level').value || 0),
      school: document.getElementById('school').value.trim(),
      college: document.getElementById('college').value.trim(),
      contact_name: document.getElementById('contact_name').value.trim(),
      contact_email: document.getElementById('contact_email').value.trim(),
      position: document.getElementById('position').value.trim(),
    };

    // Validation
    if (!body.program_code || !body.plan_code) {
      return alert('Program code and Plan code are required.');
    }
    if (!body.program_name || !body.plan_name) {
      return alert('Program name and Plan name are required.');
    }
    if (isNaN(body.aqf_level) || body.aqf_level <= 0) {
      return alert('AQF level must be a number greater than 0.');
    }
    if (body.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contact_email)) {
      return alert('Invalid email format.');
    }

    try {
      const res = await fetch('https://z0jhqewof9.execute-api.ap-southeast-2.amazonaws.com/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        alert('Program created successfully.');
        programForm.reset();
      } else {
        const msg = await res.text();
        alert('Error creating program: ' + msg);
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  });

  // Show delete confirmation popup
  deleteBtn.addEventListener('click', () => {
    deletePopup.classList.remove('hidden');
    overlay.classList.remove('hidden');
  });

  // Cancel delete popup
  document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
    deletePopup.classList.add('hidden');
    overlay.classList.add('hidden');
  });

  // Confirm delete API call
  document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    try {
      const res = await fetch('https://z0jhqewof9.execute-api.ap-southeast-2.amazonaws.com/programs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lastSearch),
      });

      if (res.ok) {
        alert('Program deleted.');
        programResult.classList.add('hidden');
        deleteBtn.style.display = 'none';
        deleteBtn.disabled = true;
        lastSearch = {};
      } else {
        const msg = await res.text();
        alert('Delete failed: ' + msg);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      deletePopup.classList.add('hidden');
      overlay.classList.add('hidden');
    }
  });
});
