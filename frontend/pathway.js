document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchPathwayForm");
  const pathwayResultDiv = document.getElementById("pathwayResult");
  const pathwayDetailsDiv = document.getElementById("pathwayDetails");

  const API_URL = "https://23uzbyzsh5.execute-api.ap-southeast-2.amazonaws.com/prod/pathway";

  // Builds a nicely formatted pathway detail + course mappings
  function buildPathwayDetailsTable(p) {
    const fields = [
      ["source_program_code", "Source Program Code"],
      ["source_plan_code", "Source Plan Code"],
      ["destination_program_code", "Destination Program Code"],
      ["destination_plan_code", "Destination Plan Code"],
      ["status", "Status"],
      ["internal_status", "Internal Status"],
      ["effective_date", "Effective Date"],
      ["version_number", "Version Number"],
      ["pathway_background", "Pathway Background"],
      ["pathway_summary", "Pathway Summary"],
      ["final_intake_previous", "Final Intake Previous"],
      ["first_intake", "First Intake"],
      ["intake_sem1", "Intake Sem 1"],
      ["intake_sem2", "Intake Sem 2"],
      ["remaining_duration_sem1", "Remaining Duration Sem 1"],
      ["remaining_duration_sem2", "Remaining Duration Sem 2"],
    ];

    let html = `<table class="pathway-table"><tbody>`;
    fields.forEach(([key, label]) => {
      const val = p[key] !== undefined && p[key] !== null && p[key] !== "" ? p[key] : "N/A";
      html += `
        <tr>
          <th>${label}</th>
          <td>${val}</td>
        </tr>`;
    });
    html += `</tbody></table>`;

    // Course mappings section
    html += `<hr/><h4>Course Mappings</h4>`;
    if (!p.course_mappings || p.course_mappings.length === 0) {
      html += "<p>No course mappings found for this pathway.</p>";
    } else {
      p.course_mappings.forEach(mapping => {
        html += `
          <div class="mapping" style="border:1px solid #ccc; padding:10px; margin-bottom:1rem;">
            <p><strong>Major/Minor:</strong> ${mapping.major_minor_name || "N/A"}</p>
            <p><strong>Credit Points:</strong> ${mapping.credit_points || "N/A"}</p>
            <p><strong>Source Courses:</strong></p>
            <ul>
              ${mapping.source_courses.map(sc => `<li>${sc.source_course_code} - ${sc.course_name}</li>`).join("")}
            </ul>
            <p><strong>Destination Courses:</strong></p>
            <ul>
              ${mapping.destination_courses.map(dc => `<li>${dc.destination_course_code} - ${dc.course_name}</li>`).join("")}
            </ul>
          </div>
        `;
      });
    }

    return html;
  }

  // Load recent pathways preview
  async function loadRecentPathways() {
    const tableBody = document.getElementById("recentPathwaysBody");
    try {
      const url = new URL(API_URL);
      url.searchParams.append("action", "list_recent");

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to load recent pathways");

      const data = await response.json();
      if (!Array.isArray(data.pathways) || data.pathways.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='5'>No recent pathways found.</td></tr>";
        return;
      }

      tableBody.innerHTML = "";
      data.pathways.forEach(p => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${p.source_plan_code}</td>
          <td>${p.destination_plan_code}</td>
          <td>${p.status || "N/A"}</td>
          <td>${p.effective_date || "N/A"}</td>
          <td>${p.version_number || "N/A"}</td>
        `;
        tableBody.appendChild(row);
      });
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="5" style="color:red;">${err.message}</td></tr>`;
    }
  }

  // Handle form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    pathwayResultDiv.classList.add("hidden");
    pathwayDetailsDiv.innerHTML = "<p>Loading pathway data...</p>";
    pathwayResultDiv.classList.remove("hidden");

    const source_program_code = document.getElementById("searchSrcProgram").value.trim();
    const source_plan_code = document.getElementById("searchSrcPlan").value.trim();
    const destination_program_code = document.getElementById("searchDestProgram").value.trim();
    const destination_plan_code = document.getElementById("searchDestPlan").value.trim();

    try {
      const url = new URL(API_URL);
      url.searchParams.append("action", "get_pathway");
      url.searchParams.append("source_program_code", source_program_code);
      url.searchParams.append("source_plan_code", source_plan_code);
      url.searchParams.append("destination_program_code", destination_program_code);
      url.searchParams.append("destination_plan_code", destination_plan_code);

      const response = await fetch(url);
      if (!response.ok) {
        const error = await response.json();
        pathwayDetailsDiv.innerHTML = `<p style="color:red;">Error: ${error.error || response.statusText}</p>`;
        return;
      }

      const data = await response.json();
      pathwayDetailsDiv.innerHTML = buildPathwayDetailsTable(data);

    } catch (err) {
      pathwayDetailsDiv.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    }
  });

  // Load recent list on load
  loadRecentPathways();
});
