document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchCourseForm');
  const addToggleBtn = document.getElementById('addCourseToggleBtn');
  const courseForm = document.getElementById('courseForm');
  const courseResult = document.getElementById('courseResult');
  const tableBody = document.getElementById('courseTableBody');
  const deletePopup = document.getElementById('deleteConfirmPopup');
  const overlay = document.getElementById('overlay');
  const deleteBtn = document.getElementById('deleteCourseBtn');

  let lastCourse = null;

  deleteBtn.style.display = 'none';
  deleteBtn.disabled = true;

  addToggleBtn.addEventListener('click', () => {
    courseForm.classList.toggle('hidden');
  });

  function fillForm(data) {
    courseForm.course_code.value = data.course_code || '';
    courseForm.course_name.value = data.course_name || '';
    courseForm.program_code.value = data.program_code || '';
    courseForm.plan_code.value = data.plan_code || '';
  }

  function clearForm() {
    courseForm.reset();
  }

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const course_code = document.getElementById('searchCourseCode').value.trim();
    const program_code = document.getElementById('searchProgramCode').value.trim();
    const plan_code = document.getElementById('searchPlanCode').value.trim();

    let url = 'https://3uh32o9yc4.execute-api.ap-southeast-2.amazonaws.com/courses';

    const params = new URLSearchParams();
    if (course_code) params.append('course_code', course_code);
    if (program_code) params.append('program_code', program_code);
    if (plan_code) params.append('plan_code', plan_code);

    // If no search input, limit results to 10
    if (!course_code && !program_code && !plan_code) {
      params.append('limit', '10');
    }

    if (params.toString()) url += `?${params.toString()}`;

    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const courses = data.courses || [];

        if (courses.length === 0) {
          alert('No matching courses found.');
          courseResult.classList.add('hidden');
          deleteBtn.style.display = 'none';
          deleteBtn.disabled = true;
          lastCourse = null;
          clearForm();
          return;
        }

        tableBody.innerHTML = courses.map(course => `
          <tr>
            <td>${course.course_code}</td>
            <td>${course.course_name}</td>
            <td>${course.program_code}</td>
            <td>${course.plan_code}</td>
          </tr>
        `).join('');

        lastCourse = courses.length === 1 ? courses[0] : null;
        if (lastCourse) {
          fillForm(lastCourse);
          courseForm.classList.add('hidden');
          deleteBtn.style.display = 'inline-block';
          deleteBtn.disabled = false;
        } else {
          clearForm();
          deleteBtn.style.display = 'none';
          deleteBtn.disabled = true;
        }

        courseResult.classList.remove('hidden');
      } else {
        alert('Search failed.');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  });

  courseForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const body = {
      course_code: courseForm.course_code.value.trim(),
      course_name: courseForm.course_name.value.trim(),
      program_code: courseForm.program_code.value.trim(),
      plan_code: courseForm.plan_code.value.trim()
    };

    if (!body.course_code || !body.course_name || !body.program_code || !body.plan_code) {
      return alert('All fields are required.');
    }

    const isUpdate = (
      lastCourse &&
      lastCourse.course_code === body.course_code &&
      lastCourse.program_code === body.program_code &&
      lastCourse.plan_code === body.plan_code
    );

    const method = isUpdate ? 'PUT' : 'POST';

    try {
      const res = await fetch('https://3uh32o9yc4.execute-api.ap-southeast-2.amazonaws.com/courses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        alert(`Course ${method === 'POST' ? 'created' : 'updated'} successfully.`);
        lastCourse = body;
        courseForm.classList.add('hidden');
        searchForm.dispatchEvent(new Event('submit'));
      } else {
        const msg = await res.text();
        alert(`Failed to ${method === 'POST' ? 'create' : 'update'} course: ${msg}`);
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  });

  deleteBtn.addEventListener('click', () => {
    deletePopup.classList.remove('hidden');
    overlay.classList.remove('hidden');
  });

  document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
    deletePopup.classList.add('hidden');
    overlay.classList.add('hidden');
  });

  document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    if (!lastCourse) {
      alert('No course selected to delete.');
      return;
    }

    try {
      const res = await fetch('https://3uh32o9yc4.execute-api.ap-southeast-2.amazonaws.com/courses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_code: lastCourse.course_code,
          program_code: lastCourse.program_code,
          plan_code: lastCourse.plan_code
        }),
      });

      if (res.ok) {
        alert('Course deleted.');
        courseResult.classList.add('hidden');
        deleteBtn.style.display = 'none';
        deleteBtn.disabled = true;
        lastCourse = null;
        clearForm();
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
