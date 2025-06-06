async function loadOverviewData() {
  try {
    const response = await fetch('https://y8a5jiu6ag.execute-api.ap-southeast-2.amazonaws.com/getOverviewData');
    const data = await response.json();

    // Populate summary counts
    document.getElementById('program-count').textContent = data.counts.program_count;
    document.getElementById('pathway-count').textContent = data.counts.pathway_count;
    document.getElementById('mapping-count').textContent = data.counts.mapping_count;
    document.getElementById('user-count').textContent = data.counts.user_count;

    // Populate recent updates table
    const tableBody = document.getElementById("recent-updates-body");
    tableBody.innerHTML = ""; // clear any existing rows

    data.recent_updates.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.source_program_code} ${row.source_plan_code} → ${row.destination_program_code} ${row.destination_plan_code}</td>
        <td>${row.version_number || "N/A"}</td>
        <td>${row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "N/A"}</td>
      `;
      tableBody.appendChild(tr);
    });

  } catch (err) {
    console.error("Failed to load overview:", err);
  }
}

window.onload = loadOverviewData;
