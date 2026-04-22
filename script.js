
let globalExcelData = [];
let currentFilteredData = []; // 🔥 ADD THIS LINE to store the filtered state
let colMapping = {};
let barChartInstance = null;
let pieChartInstance = null;
let top10ChartInstance = null; // 🔥 ADD THIS LINE
let globalArunGrids = "-"; // 🔥 NEW: Store Arun's grids globally

document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("fileInput");
  const fileNameText = document.getElementById("fileName");

  const filters = ["monthFilter", "weekFilter", "statusFilter", "totalCompletionFilter", "postCompletionFilter", "sfhCompletionFilter"];
  filters.forEach(id => {
    document.getElementById(id).addEventListener("change", applyFilters);
  });

  // 🔥 1. PASTE TOGGLE LOGIC HERE (Around Line 16)
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      themeToggle.innerText = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
      if (currentFilteredData && currentFilteredData.length > 0) {
        calculateAndRender(currentFilteredData);
      }
    });
  }

  

  if (fileInput) {
    fileInput.addEventListener("change", function (e) {
      const fileName = e.target.files[0]?.name || "No file selected";
      fileNameText.innerText = fileName;
      handleFile(e);
    });
  }
});

function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // 🔥 NEW: Extract "Grids given by Arun" from Cell B1 before parsing the rest of the sheet
    const cellB1 = sheet['B1'] ? String(sheet['B1'].v) : "";
    const arunMatch = cellB1.match(/\d+/); // Finds the first number in the text
    globalArunGrids = arunMatch ? arunMatch[0] : "-";

    globalExcelData = XLSX.utils.sheet_to_json(sheet, { range: 1 });
    
    if (globalExcelData.length > 0) {
      identifyColumns(globalExcelData[0]);
      populateSlicers(globalExcelData);
      document.getElementById("filtersContainer").style.display = "flex";
      document.getElementById("tableContainer").style.display = "block"; // 🔥 Paste this on the new Line 44
      applyFilters();
    }
  };
  reader.readAsArrayBuffer(file);
}

function identifyColumns(sampleRow) {
  const keys = Object.keys(sampleRow);
  colMapping.month = keys.find(k => k.toLowerCase() === "month");
  colMapping.week = keys.find(k => k.toLowerCase().includes("sfh ending week"));
  colMapping.status = keys.find(k => k.toLowerCase() === "status");
  colMapping.totalComplete = keys.find(k => k.toLowerCase().includes("total 100% complete"));
  colMapping.postComplete = keys.find(k => k.toLowerCase().includes("post completion"));
  colMapping.sfhComplete = keys.find(k => k.toLowerCase().includes("sfh completion"));
  colMapping.pendingUids = keys.find(k => k.toLowerCase().includes("pending uids") && !k.toLowerCase().includes("sfh"));
  colMapping.sfhPendingUids = keys.find(k => k.toLowerCase().includes("sfh pending uids"));
  colMapping.gridId = keys.find(k => k.toLowerCase().includes("grid") && !k.toLowerCase().includes("total")); // 🔥 Paste this here
}

function populateSlicers(data) {
  const monthSet = new Set();
  const weekSet = new Set();
  const statusSet = new Set();

  data.forEach(row => {
    if (colMapping.month && row[colMapping.month]) monthSet.add(Number(row[colMapping.month]));
    if (colMapping.week && row[colMapping.week]) weekSet.add(Number(row[colMapping.week]));
    if (colMapping.status && row[colMapping.status] && !String(row[colMapping.status]).includes("#")) {
        statusSet.add(row[colMapping.status].trim());
    }
  });

  const monthSelect = document.getElementById("monthFilter");
  monthSelect.innerHTML = '<option value="all">All Months</option>';
  [...monthSet].filter(m => !isNaN(m) && m > 0).sort((a, b) => a - b).forEach(month => {
    monthSelect.innerHTML += `<option value="${month}">Month ${month}</option>`;
  });

  const weekSelect = document.getElementById("weekFilter");
  weekSelect.innerHTML = '<option value="all">All Weeks</option>';
  [...weekSet].filter(w => !isNaN(w) && w > 0).sort((a, b) => b - a).forEach(week => {
    weekSelect.innerHTML += `<option value="${week}">Week ${week}</option>`;
  });

  const statusSelect = document.getElementById("statusFilter");
  statusSelect.innerHTML = '<option value="all">All Statuses</option>';
  [...statusSet].sort().forEach(status => {
    statusSelect.innerHTML += `<option value="${status}">${status}</option>`;
  });
}

function parsePercent(val) {
  if (val === undefined || val === null || String(val).includes("#")) return null;
  if (typeof val === "number") return val <= 1 ? val * 100 : val; 
  let num = Number(String(val).replace("%", "").trim());
  return isNaN(num) ? null : num;
}

function checkPercentageFilter(rowValue, filterValue) {
  if (filterValue === "all") return true;
  let percent = parsePercent(rowValue);
  
  if (percent === null) return false;
  if (filterValue === "100") return percent >= 99.9;
  if (filterValue === "0") return percent === 0;
  if (filterValue === "in_progress") return percent > 0 && percent < 99.9;
  return true;
}

function applyFilters() {
  const selectedMonth = document.getElementById("monthFilter").value;
  const selectedWeek = document.getElementById("weekFilter").value;
  const selectedStatus = document.getElementById("statusFilter").value;
  const selectedTotal = document.getElementById("totalCompletionFilter").value;
  const selectedPost = document.getElementById("postCompletionFilter").value;
  const selectedSfh = document.getElementById("sfhCompletionFilter").value;

  // 🔥 CHANGED: Saving to currentFilteredData instead of a local let variable
  currentFilteredData = globalExcelData.filter(row => {
    let keep = true;

    if (selectedMonth !== "all") keep = keep && Number(row[colMapping.month]) === Number(selectedMonth);
    if (selectedWeek !== "all") keep = keep && Number(row[colMapping.week]) === Number(selectedWeek);
    if (selectedStatus !== "all") keep = keep && row[colMapping.status] === selectedStatus;

    keep = keep && checkPercentageFilter(row[colMapping.totalComplete], selectedTotal);
    keep = keep && checkPercentageFilter(row[colMapping.postComplete], selectedPost);
    keep = keep && checkPercentageFilter(row[colMapping.sfhComplete], selectedSfh);

    return keep;
  });

  // 🔥 CHANGED: Passing the global variable into the render function
  calculateAndRender(currentFilteredData);
}

function calculateAndRender(data) {
  const is100 = (val) => {
    let p = parsePercent(val);
    return p !== null && p >= 99.9;
  };

  const gridsCount = data.filter(r => is100(r[colMapping.totalComplete])).length;
  const backlogPostCount = data.filter(r => r[colMapping.postComplete] !== undefined && !is100(r[colMapping.postComplete])).length;
  const sfhBacklogCount = data.filter(r => r[colMapping.sfhComplete] !== undefined && !is100(r[colMapping.sfhComplete])).length;
  const totalBacklogCount = data.filter(r => r[colMapping.totalComplete] !== undefined && !is100(r[colMapping.totalComplete])).length;

  let totalPending = 0, sfhPending = 0, lowPendingCount = 0;

  data.forEach(r => {
    let pUIDs = Number(r[colMapping.pendingUids]) || 0;
    let sfhUIDs = Number(r[colMapping.sfhPendingUids]) || 0;
    
    totalPending += pUIDs;
    sfhPending += sfhUIDs;
    
    let pendingVal = r[colMapping.pendingUids];
    if (pendingVal !== undefined && pendingVal !== null && pendingVal !== "") {
        let num = Number(pendingVal);
        if (!isNaN(num) && num <= 20) {
            lowPendingCount++;
        }
    }
  });

  // 🔥 NEW: Calculate dynamic total grids
  const dynamicTotalGrids = gridsCount + totalBacklogCount;

  // Update HTML text
  document.getElementById("dynamicTotalGrids").innerText = dynamicTotalGrids;
  document.getElementById("arunGridsCount").innerText = globalArunGrids;
  document.getElementById("gridsCount").innerText = gridsCount;
  document.getElementById("backlogPostCount").innerText = backlogPostCount;
  document.getElementById("sfhBacklogCount").innerText = sfhBacklogCount;
  document.getElementById("totalBacklogCount").innerText = totalBacklogCount;
  document.getElementById("totalPendingCount").innerText = totalPending;
  document.getElementById("sfhPendingCount").innerText = sfhPending;
  document.getElementById("lowPendingCount").innerText = lowPendingCount;

  renderCharts(gridsCount, backlogPostCount, sfhBacklogCount, totalBacklogCount, data);
  renderTable(data); // 🔥 Paste this right below the charts

  // 🔥 Trigger the entrance animations
  document.querySelectorAll('.chart-card, .table-container').forEach((el, index) => {
    el.classList.remove('animate-pop'); // Reset animation
    void el.offsetWidth; // Force browser to acknowledge the reset
    el.style.animationDelay = `${index * 0.15}s`; // Stagger the pop-ins!
    el.classList.add('animate-pop'); // Start animation
  });

}

function renderCharts(gridsCount, backlogPostCount, sfhBacklogCount, totalBacklogCount, data) {
  const barCtx = document.getElementById("barChart");
  const pieCtx = document.getElementById("pieChart");
  const top10Ctx = document.getElementById("top10Chart"); // 🔥 NEW

  if (barChartInstance) barChartInstance.destroy();
  if (pieChartInstance) pieChartInstance.destroy();
  if (top10ChartInstance) top10ChartInstance.destroy(); // 🔥 NEW

  Chart.defaults.font.family = "'Inter', 'Segoe UI', sans-serif";

  // 🔥 2. PASTE COLOR LOGIC HERE
  const isDark = document.body.classList.contains("dark-mode");
  Chart.defaults.color = isDark ? "#e0e0e0" : "#666";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";

  // 1. Backlog Overview Bar Chart
  if (barCtx) {
    barChartInstance = new Chart(barCtx, {
      type: "bar",
      data: {
        labels: ["Processed", "Backlog", "SFH Backlog"],
        datasets: [{ 
            data: [gridsCount, backlogPostCount, sfhBacklogCount], 
            backgroundColor: ["#4CAF50", "#FF9800", "#2196F3"], 
            borderRadius: 6 
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } ,
    scales: {
          x: { grid: { color: gridColor } },
          y: { grid: { color: gridColor } }
        }}
    });
  }

  // 2. Completion Split Pie Chart
  if (pieCtx) {
    pieChartInstance = new Chart(pieCtx, {
      type: "pie",
      data: {
        labels: ["Resolved (Grids)", "Pending (Grids)"],
        datasets: [{ 
            data: [gridsCount, totalBacklogCount], 
            backgroundColor: ["#4CAF50", "#F44336"], 
            borderWidth: 2, 
            borderColor: "#fff" 
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  // 🔥 3. NEW: Top 10 Needs Attention Chart
  if (top10Ctx && data) {
    // Sort data to find the top 10 highest Pending UIDs
    const sortedGrids = [...data]
      .map(r => ({
        id: r[colMapping.gridId] || "Unknown",
        pending: Number(r[colMapping.pendingUids]) || 0
      }))
      .filter(g => g.pending > 0) // Ignore grids with 0 pending
      .sort((a, b) => b.pending - a.pending) // Sort Highest to Lowest
      .slice(0, 10); // Take the top 10

    const top10Labels = sortedGrids.map(g => g.id);
    const top10Data = sortedGrids.map(g => g.pending);

    top10ChartInstance = new Chart(top10Ctx, {
      type: "bar", // We use 'bar' but make it horizontal below
      data: {
        labels: top10Labels,
        datasets: [{
          label: "Pending UIDs",
          data: top10Data,
          backgroundColor: "#e53935", // Red to indicate "needs attention"
          borderRadius: 4
        }]
      },
options: {
        indexAxis: 'y', // 🔥 This makes the bar chart horizontal!
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: gridColor } },
          y: { grid: { color: gridColor } }
        }
      }
    });
  }
}

function renderTable(data) {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = ""; // Clear existing rows

  // To prevent the browser from freezing on massive files, limit to top 100 rows
  const displayData = data.slice(0, 100);

  displayData.forEach(row => {
    // Format percentages nicely for the table
    let totalComp = row[colMapping.totalComplete];
    if (typeof totalComp === "number" && totalComp <= 1) {
      totalComp = (totalComp * 100).toFixed(2) + "%";
    } else if (totalComp === undefined || String(totalComp).includes("#")) {
      totalComp = "N/A";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${row[colMapping.gridId] || "Unknown"}</strong></td>
      <td>${row[colMapping.month] || "-"}</td>
      <td>${row[colMapping.week] || "-"}</td>
      <td><span style="color: ${row[colMapping.status] === 'Completed' ? '#2e7d32' : '#e53935'}; font-weight: 600;">${row[colMapping.status] || "-"}</span></td>
      <td>${totalComp}</td>
      <td>${row[colMapping.pendingUids] || 0}</td>
      <td>${row[colMapping.sfhPendingUids] || 0}</td>
    `;
    tbody.appendChild(tr);
  });
}

// 🔥 NEW: Export to Excel Logic
document.getElementById("exportBtn")?.addEventListener("click", function() {
  if (currentFilteredData.length === 0) {
    alert("No data available to export!");
    return;
  }

  // Convert the JSON data back to an Excel Worksheet
  const worksheet = XLSX.utils.json_to_sheet(currentFilteredData);
  
  // Create a new Workbook and append the sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered_WBR");

  // Trigger the download
  XLSX.writeFile(workbook, "WBR_Filtered_Data.xlsx");
});

/* ========================================= */
/* 📥 CLICK-TO-DOWNLOAD CARD LOGIC           */
/* ========================================= */

// 1. Helper function to trigger CSV download
// function downloadCSV(filename, csvArray) {
//   const csvContent = "data:text/csv;charset=utf-8," + csvArray.map(e => e.join(",")).join("\n");
//   const encodedUri = encodeURI(csvContent);
//   const link = document.createElement("a");
//   link.setAttribute("href", encodedUri);
//   link.setAttribute("download", filename);
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// }

// // 2. Attach click listener to the Backlog Card
// document.addEventListener("DOMContentLoaded", function () {
//   const backlogCard = document.getElementById("downloadBacklogCard");
  
//   if (backlogCard) {
//     backlogCard.addEventListener("click", function () {
//       // Check if data is loaded
//       if (!currentFilteredData || currentFilteredData.length === 0) {
//         alert("Please upload a file and generate the dashboard first.");
//         return;
//       }

//       // Prepare the header row for our Excel/CSV file
//       const csvData = [["Grid ID", "Pending UPIDs"]];
//       const seenGrids = new Set(); // To ensure we only get unique grids

//       // Loop through the currently filtered data
//       currentFilteredData.forEach(row => {
//         const gridId = row[colMapping.gridId];
//         const pendingUPIDs = parseInt(row[colMapping.pendingUids]) || 0;
//         const totalComplete = parseFloat(row[colMapping.totalComplete]) || 0;

//         // 🔥 FILTER LOGIC: Grids in Backlog 
//         // Adjust this IF statement if your definition of "Backlog" is different.
//         // Here we check if the grid is not 100% complete and has pending UPIDs.
//         const isBacklog = (totalComplete < 1 && totalComplete < 100) || pendingUPIDs > 0;

//         if (isBacklog && gridId && !seenGrids.has(gridId)) {
//           seenGrids.add(gridId); // Mark as seen so we don't duplicate
//           csvData.push([gridId, pendingUPIDs]); // Add row to Excel
//         }
//       });

//       // Check if we actually found any data
//       if (csvData.length === 1) {
//         alert("No backlog grids found for the current filters.");
//         return;
//       }

//       // Trigger the download!
//       downloadCSV("Backlog_Grids_Report.csv", csvData);
//     });
//   }
// });

function downloadCSV(filename, csvArray) {
  const csvContent = "data:text/csv;charset=utf-8," + csvArray.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 2. Attach click listener to the Backlog Card
document.addEventListener("DOMContentLoaded", function () {
  const backlogCard = document.getElementById("downloadBacklogCard");
  
  if (backlogCard) {
    backlogCard.addEventListener("click", function () {
      if (!currentFilteredData || currentFilteredData.length === 0) {
        alert("Please upload a file and generate the dashboard first.");
        return;
      }

      // 🔥 IMPORTANT: Change this to the EXACT header name in your Excel file that contains the UPID text
      const upidColumnName = "UPID"; 

      // We use an object to group all UPIDs together under their Grid ID
      const backlogGrids = {};

      // Loop through the currently filtered data
      currentFilteredData.forEach(row => {
        const gridId = row[colMapping.gridId];
        const pendingCount = parseInt(row[colMapping.pendingUids]) || 0;
        const totalComplete = parseFloat(row[colMapping.totalComplete]) || 0;

        // Check if it is a backlog grid
        const isBacklog = (totalComplete < 1 && totalComplete < 100) || pendingCount > 0;

        if (isBacklog && gridId) {
          // If we haven't seen this grid yet, initialize it
          if (!backlogGrids[gridId]) {
            backlogGrids[gridId] = {
              count: pendingCount, // The total number of pending
              upids: new Set()     // A set to collect unique UPID strings
            };
          }

          // Grab the actual UPID string from the row
          const actualUpid = row[upidColumnName];
          if (actualUpid) {
            backlogGrids[gridId].upids.add(actualUpid);
          }
        }
      });

      // Prepare the header row for our Excel/CSV file
      const csvData = [["Grid ID", "Total Pending Count", "List of Pending UPIDs"]];

      // Convert our grouped data into Excel rows
      for (const gridId in backlogGrids) {
        const data = backlogGrids[gridId];
        
        // Join all the collected UPIDs together with a comma
        const upidString = Array.from(data.upids).join(", ");
        
        // Wrap the string in quotes so the commas don't accidentally split the Excel columns!
        const safeUpidString = `"${upidString}"`; 

        csvData.push([gridId, data.count, safeUpidString]);
      }

      if (csvData.length === 1) {
        alert("No backlog grids found for the current filters.");
        return;
      }

      // Trigger the download!
      downloadCSV("Backlog_Grids_Detailed.csv", csvData);
    });
  }
});