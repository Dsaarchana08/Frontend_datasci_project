document.addEventListener('DOMContentLoaded', function() {
  const uploadForm = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileInput');
  const fileInfoContainer = document.createElement('div');
  fileInfoContainer.className = 'file-info';
  fileInput.parentNode.insertBefore(fileInfoContainer, fileInput.nextSibling);
  const dragDropText = document.querySelector('.upload-label p');

  // Create status message container
  const statusMessage = document.createElement('div');
  statusMessage.className = 'status-message';
  document.body.appendChild(statusMessage);
  statusMessage.style.display = 'none';

  // Show/hide status messages
  function showStatus(msg) {
    statusMessage.textContent = msg;
    statusMessage.style.display = 'block';
  }
  function hideStatus() {
    statusMessage.style.display = 'none';
  }

  // Show custom alert messages (success/info/error)
  function showCustomAlert(message, type) {
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) existingAlert.remove();

    const alertBox = document.createElement('div');
    alertBox.className = `custom-alert ${type}`;
    alertBox.textContent = message;
    document.body.appendChild(alertBox);

    setTimeout(() => alertBox.remove(), 5000);
  }

  // Handle file selection UI
  fileInput.addEventListener('change', function() {
    fileInfoContainer.innerHTML = '';

    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const fileName = file.name;

      if (!fileName.endsWith('.xlsx')) {
        showCustomAlert('Only .xlsx Excel files are allowed.', 'error');
        fileInput.value = '';
        return;
      }

      const icon = document.createElement('i');
      icon.className = 'fas fa-file-excel';
      icon.style.marginRight = '10px';
      icon.style.color = '#1d6f42';

      const fileNameSpan = document.createElement('span');
      fileNameSpan.textContent = fileName;
      fileNameSpan.style.color = '#333';

      fileInfoContainer.appendChild(icon);
      fileInfoContainer.appendChild(fileNameSpan);
      if (dragDropText) dragDropText.style.display = 'none';
    } else {
      if (dragDropText) dragDropText.style.display = 'block';
      fileInfoContainer.innerHTML = '';
    }
  });

  // Handle form submit
  uploadForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const file = fileInput.files[0];

    if (!file || !file.name.endsWith('.xlsx')) {
      showCustomAlert('Please select a valid .xlsx file before uploading.', 'error');
      return;
    }

    try {
      showStatus('Uploading file... Please wait.');

      // Step 1: Request presigned URL & s3Key
      const presignRes = await fetch("https://kdq3wkki4b.execute-api.ap-southeast-2.amazonaws.com/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name })
      });

      if (!presignRes.ok) {
        throw new Error(`Failed to get upload URL: ${presignRes.statusText}`);
      }

      const responseBody = await presignRes.json();
      const uploadUrl = responseBody.uploadUrl;
      const s3Key = responseBody.s3Key;  // e.g. "uploads/123456789_filename.xlsx"

      // Step 2: Upload file to S3 using presigned URL
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
        body: file
      });

      if (!uploadRes.ok) {
        throw new Error(`File upload failed: ${uploadRes.statusText}`);
      }

      showStatus("File uploaded. Validating CARF form... Please wait.");

      // Step 3: Poll validation status using filename only (remove "uploads/" prefix)
      const filenameOnly = s3Key.split('/').pop();

      await pollValidationStatus(filenameOnly);

      // Clear UI for new uploads
      fileInput.value = '';
      fileInfoContainer.innerHTML = '';

    } catch (error) {
      hideStatus();
      showCustomAlert("Upload failed: " + error.message, 'error');
      if (dragDropText) dragDropText.style.display = 'block';
    }
  });

  // Poll validation status API until success, failure or timeout
  async function pollValidationStatus(filename) {
    let attempts = 0;

    const poll = async () => {
      try {
        const res = await fetch(`https://s6be883euj.execute-api.ap-southeast-2.amazonaws.com/validation-status?filename=${encodeURIComponent(filename)}`);
        const data = await res.json();

        if (res.status === 202) {
          if (attempts++ < 20) {  // 20 attempts max
            setTimeout(poll, 3000);  // 3 seconds between polls
          } else {
            hideStatus();
            showCustomAlert("Validation timed out. Please try again later.", "error");
            if (dragDropText) dragDropText.style.display = 'block';
          }
        } else {
          hideStatus();
          if (data.status === "success") {
            showCustomAlert(data.message, "success");
          } else {
            const errors = data.errors ? data.errors.join(", ") : "Unknown error";
            showCustomAlert(`${data.message}: ${errors}`, "error");
          }
          if (dragDropText) dragDropText.style.display = 'block';
        }
      } catch (err) {
        hideStatus();
        showCustomAlert("Validation check failed: " + err.message, "error");
        if (dragDropText) dragDropText.style.display = 'block';
      }
    };

    poll();
  }
});
