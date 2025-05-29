document.addEventListener('DOMContentLoaded', function() {
  const uploadForm = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileInput');

  // Create a container to display file name and icon
  const fileInfoContainer = document.createElement('div');
  fileInfoContainer.className = 'file-info';
  fileInput.parentNode.insertBefore(fileInfoContainer, fileInput.nextSibling);

  // Reference to drag-and-drop text (assumes it's inside a <p> within .upload-label)
  const dragDropText = document.querySelector('.upload-label p');

  // Show selected file name and icon when a file is chosen
  fileInput.addEventListener('change', function() {
    fileInfoContainer.innerHTML = ''; // Clear previous content

    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const fileName = file.name;
      const fileType = file.type;

      // Determine icon class based on file type
      let iconClass = 'fas fa-file';
      if (fileType.includes('pdf')) iconClass = 'fas fa-file-pdf';
      else if (fileType.includes('spreadsheet') || fileName.endsWith('.xlsx')) iconClass = 'fas fa-file-excel';
      else if (fileType.includes('word') || fileName.endsWith('.docx')) iconClass = 'fas fa-file-word';

      const icon = document.createElement('i');
      icon.className = iconClass;
      icon.style.marginRight = '10px';
      icon.style.color = '#555';

      const fileNameSpan = document.createElement('span');
      fileNameSpan.textContent = fileName;
      fileNameSpan.style.color = '#333';

      fileInfoContainer.appendChild(icon);
      fileInfoContainer.appendChild(fileNameSpan);

      // Hide drag-and-drop text
      if (dragDropText) {
        dragDropText.style.display = 'none';
      }
    } else {
      // Show drag-and-drop text again if no file selected
      if (dragDropText) {
        dragDropText.style.display = 'block';
      }
      fileInfoContainer.innerHTML = '';
    }
  });

  uploadForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const file = fileInput.files[0];

    if (!file) {
        showCustomAlert('Please select a file before uploading.', 'error');
        return;
    }

    console.log('Uploading:', file.name);

    showCustomAlert(`File "${file.name}" uploaded successfully!`, 'success');

    // Optional: Clear input and file info display
    fileInput.value = '';
    fileInfoContainer.innerHTML = '';
    if (dragDropText) {
      dragDropText.style.display = 'block'; // Show drag-and-drop text again
    }
  });

  // Helper function to show custom alerts
  function showCustomAlert(message, type) {
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
      existingAlert.remove();
    }

    const alertBox = document.createElement('div');
    alertBox.className = `custom-alert ${type}`;
    alertBox.textContent = message;
    document.body.appendChild(alertBox);

    setTimeout(() => {
      alertBox.remove();
    }, 3000);
  }
});
