📊 Amazon Weekly Business Review (WBR) Automation Dashboard

A lightweight, interactive web-based dashboard designed to automate **Weekly Business Review (WBR)** reporting by transforming raw Excel/CSV data into actionable insights — entirely in the browser.

## 🔗 Live Demo
👉 https://ruthwickkalahasti.github.io/Weekly_Business_Review_Dashboard/

---

## 🚀 Overview

This project replicates a real-world **Amazon-style WBR reporting workflow**, where large operational datasets are manually analyzed each week.

👉 This tool automates that process by:

* Parsing Excel/CSV files instantly
* Generating KPI metrics & visual insights
* Enabling dynamic filtering and drill-down

⚡ Result: **Reduced manual reporting effort by ~4 hours**

---

## ⚠️ Problem Statement

Weekly Business Review (WBR) reporting in operations teams is typically:
- Manual and time-consuming
- Excel-heavy with repetitive calculations
- Prone to human errors
- Lacking real-time insights

This project solves these challenges by automating the entire workflow.

---
## 💥 Impact

- ⏱️ Reduced manual reporting effort by ~4 hours per cycle
- ⚡ Enabled instant KPI generation from raw data
- 📊 Improved visibility into backlog and performance metrics
- 📉 Reduced dependency on manual Excel analysis

---

## ⚙️ How It Works

1. User uploads Excel/CSV file
2. SheetJS parses data into JSON
3. Data is processed and structured in JavaScript
4. KPIs are calculated dynamically
5. Charts and tables are rendered using Chart.js
6. Filters update all components in real-time
7. Users can export filtered data as CSV

---
## 🚀 Future Improvements

- Dark mode support
- Backend integration for persistent storage
- User authentication & role-based dashboards
- Advanced drill-down analytics

---


## ✨ Key Features

### 📁 Local File Processing

* Upload `.csv`, `.xls`, `.xlsx` files directly
* Processed entirely in-browser using **SheetJS**
* No backend required → ensures **data privacy**

---

### 🎛️ Interactive Filtering (BI Capabilities)

* Filter by:

  * Week (auto-detected)
  * Status (Completed, In Progress)
  * Completion % (100% vs Backlog)
* Real-time updates across dashboard

---

### 📊 KPI Dashboard

* Auto-generated business metrics:

  * Total Grids
  * Backlog (Post & SFH)
  * Pending UPIDs
  * Completion %
* Color-coded cards for quick decision-making

---

### 📈 Data Visualizations

Built using **Chart.js**:

* Bar Chart → Processed vs Backlog vs SFH Backlog
* Pie Chart → Completion vs Pending split
* Top Pending Grids → Priority tracking

---

### 📥 Export Functionality

* Download filtered datasets (e.g., backlog grids)
* Enables quick reporting and stakeholder sharing

---

### 📱 Responsive UI

* Built with **CSS Grid & Flexbox**
* Works seamlessly across devices

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Libraries:**

  * SheetJS (Excel parsing)
  * Chart.js (visualizations)

---

## 📸 Screenshots

### Dashboard Overview

<img width="1898" height="879" alt="image" src="https://github.com/user-attachments/assets/2258b9ce-aaf0-41ed-a0ad-64e89ca29086" />

### KPI Cards & Filters

<img width="1868" height="721" alt="image" src="https://github.com/user-attachments/assets/8b8cd6e8-2988-410c-8c58-68deae197569" />


### Charts & Insights

<img width="1843" height="613" alt="image" src="https://github.com/user-attachments/assets/efd9414e-6740-42f9-a784-63d2ee17788e" />

<img width="1855" height="599" alt="image" src="https://github.com/user-attachments/assets/832b3225-34c4-42cb-947b-233f3f82a910" />

<img width="1856" height="805" alt="image" src="https://github.com/user-attachments/assets/b19814cd-9dcd-42fc-89e2-9584416f4d1b" />


---

## 🚀 How to Run

1. Clone repository:

   ```bash
   git clone https://github.com/yourusername/wbr-dashboard.git
   ```

2. Open:

   ```bash
   index.html
   ```

3. Upload your WBR file and explore insights

👉 No server setup required

---

## 📂 Project Structure

```
📁 wbr-dashboard
├── 📄 index.html     # UI structure
├── 🎨 style.css      # Styling & layout
└── ⚙️ script.js      # Data processing & logic
```

---

## 💡 Use Cases

* Weekly Business Reviews (WBR)
* Operations performance tracking
* Backlog & KPI monitoring
* Data-driven decision making

---

## 🤝 Contributions

Contributions are welcome! Feel free to fork and enhance features.

---

## 📝 License

MIT License
