
const salesData = [
  { order_id: "ORD001", date: "2026-09-10", product: "Wireless Mouse", category: "Electronics", quantity: 2, price: 599, region: "South", customer: "C001" },
  { order_id: "ORD002", date: "2026-09-12", product: "Notebook", category: "Stationery", quantity: 5, price: 80, region: "North", customer: "C002" },
  { order_id: "ORD003", date: "2026-09-14", product: "Running Shoes", category: "Fashion", quantity: 1, price: 2499, region: "West", customer: "C003" },
  { order_id: "ORD004", date: "2026-09-16", product: "USB Cable", category: "Electronics", quantity: 3, price: 199, region: "East", customer: "C001" },
  { order_id: "ORD005", date: "2026-09-18", product: "Office Chair", category: "Furniture", quantity: 1, price: 5499, region: "South", customer: "C004" },
  { order_id: "ORD006", date: "2026-09-20", product: "Water Bottle", category: "Home", quantity: 2, price: 399, region: "North", customer: "C005" },
  { order_id: "ORD007", date: "2026-09-22", product: "Keyboard", category: "Electronics", quantity: 1, price: 1299, region: "West", customer: "C002" },
  { order_id: "ORD008", date: "2026-09-24", product: "T-Shirt", category: "Fashion", quantity: 3, price: 499, region: "East", customer: "C006" },
  { order_id: "ORD009", date: "2026-09-26", product: "Desk Lamp", category: "Home", quantity: 2, price: 899, region: "South", customer: "C003" },
  { order_id: "ORD010", date: "2026-09-28", product: "Notebook", category: "Stationery", quantity: 4, price: 80, region: "West", customer: "C007" },
  { order_id: "ORD011", date: "2026-10-02", product: "Bluetooth Speaker", category: "Electronics", quantity: 2, price: 1799, region: "North", customer: "C008" },
  { order_id: "ORD012", date: "2026-10-05", product: "Office Chair", category: "Furniture", quantity: 2, price: 5499, region: "East", customer: "C009" },
  { order_id: "ORD013", date: "2026-10-07", product: "Running Shoes", category: "Fashion", quantity: 2, price: 2499, region: "South", customer: "C010" },
  { order_id: "ORD014", date: "2026-10-08", product: "Wireless Mouse", category: "Electronics", quantity: 4, price: 599, region: "West", customer: "C004" }
];

let revenueChart;
let categoryChart;
let regionChart;
let productChart;

const $ = (id) => document.getElementById(id);

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value);

const number = (value) =>
  new Intl.NumberFormat("en-IN").format(value);

function initializeFilters() {
  const regions = [...new Set(salesData.map(row => row.region))].sort();
  const categories = [...new Set(salesData.map(row => row.category))].sort();

  regions.forEach(region => {
    $("regionFilter").add(new Option(region, region));
  });

  categories.forEach(category => {
    $("categoryFilter").add(new Option(category, category));
  });
}

function getFilteredData() {
  const region = $("regionFilter").value;
  const category = $("categoryFilter").value;
  const period = $("dateFilter").value;
  const search = $("searchInput").value.trim().toLowerCase();

  let data = salesData.filter(row => {
    const matchesRegion = region === "All" || row.region === region;
    const matchesCategory = category === "All" || row.category === category;

    const matchesSearch =
      row.product.toLowerCase().includes(search) ||
      row.order_id.toLowerCase().includes(search) ||
      row.region.toLowerCase().includes(search) ||
      row.category.toLowerCase().includes(search);

    return matchesRegion && matchesCategory && matchesSearch;
  });

  if (period !== "All") {
    const days = Number(period);
    const latestDate = new Date(
      Math.max(...salesData.map(row => new Date(row.date).getTime()))
    );

    const cutoff = new Date(latestDate);
    cutoff.setDate(cutoff.getDate() - days);

    data = data.filter(row => new Date(row.date) >= cutoff);
  }

  return data;
}

function calculateRevenue(row) {
  return row.quantity * row.price;
}

function updateKPIs(data) {
  const revenue = data.reduce((sum, row) => sum + calculateRevenue(row), 0);
  const orders = new Set(data.map(row => row.order_id)).size;
  const units = data.reduce((sum, row) => sum + row.quantity, 0);
  const customers = new Set(data.map(row => row.customer)).size;

  $("revenueValue").textContent = money(revenue);
  $("ordersValue").textContent = number(orders);
  $("unitsValue").textContent = number(units);
  $("customersValue").textContent = number(customers);
}

function makeChart(canvasId, config, oldChart) {
  if (oldChart) oldChart.destroy();
  return new Chart($(canvasId), config);
}

function updateCharts(data) {
  const dailyRevenue = {};
  const categoryRevenue = {};
  const regionRevenue = {};
  const productRevenue = {};

  data.forEach(row => {
    const revenue = calculateRevenue(row);

    dailyRevenue[row.date] = (dailyRevenue[row.date] || 0) + revenue;
    categoryRevenue[row.category] =
      (categoryRevenue[row.category] || 0) + revenue;
    regionRevenue[row.region] =
      (regionRevenue[row.region] || 0) + revenue;
    productRevenue[row.product] =
      (productRevenue[row.product] || 0) + revenue;
  });

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { usePointStyle: true, boxWidth: 8 }
      }
    }
  };

  revenueChart = makeChart("revenueChart", {
    type: "line",
    data: {
      labels: Object.keys(dailyRevenue).sort(),
      datasets: [{
        label: "Revenue (₹)",
        data: Object.keys(dailyRevenue).sort().map(date => dailyRevenue[date]),
        borderColor: "#6558e8",
        backgroundColor: "rgba(101, 88, 232, 0.12)",
        fill: true,
        tension: 0.35,
        pointRadius: 3
      }]
    },
    options: {
      ...commonOptions,
      scales: {
        y: { beginAtZero: true, ticks: { callback: value => "₹" + value } }
      }
    }
  }, revenueChart);

  categoryChart = makeChart("categoryChart", {
    type: "doughnut",
    data: {
      labels: Object.keys(categoryRevenue),
      datasets: [{
        data: Object.values(categoryRevenue),
        backgroundColor: [
          "#6558e8", "#3b82f6", "#17a673", "#f59e0b", "#ec4899"
        ],
        borderWidth: 0
      }]
    },
    options: {
      ...commonOptions,
      cutout: "65%"
    }
  }, categoryChart);

  regionChart = makeChart("regionChart", {
    type: "bar",
    data: {
      labels: Object.keys(regionRevenue),
      datasets: [{
        label: "Revenue (₹)",
        data: Object.values(regionRevenue),
        backgroundColor: ["#6558e8", "#3b82f6", "#17a673", "#f59e0b"],
        borderRadius: 6
      }]
    },
    options: {
      ...commonOptions,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true }
      }
    }
  }, regionChart);

  const topProducts = Object.entries(productRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .reverse();

  productChart = makeChart("productChart", {
    type: "bar",
    data: {
      labels: topProducts.map(item => item[0]),
      datasets: [{
        label: "Revenue (₹)",
        data: topProducts.map(item => item[1]),
        backgroundColor: "#6558e8",
        borderRadius: 5
      }]
    },
    options: {
      ...commonOptions,
      indexAxis: "y",
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true } }
    }
  }, productChart);
}

function updateTable(data) {
  const table = $("salesTable");
  table.replaceChildren();

  $("recordCount").textContent = `Showing ${data.length} records`;
  $("emptyMessage").hidden = data.length !== 0;

  data.forEach(row => {
    const tr = document.createElement("tr");

    const values = [
      row.order_id,
      row.date,
      row.product,
      row.category,
      row.region,
      number(row.quantity),
      money(row.price),
      money(calculateRevenue(row))
    ];

    values.forEach((value, index) => {
      const td = document.createElement("td");

      if (index === 3) {
        const pill = document.createElement("span");
        pill.className = "category-pill";
        pill.textContent = value;
        td.appendChild(pill);
      } else {
        td.textContent = value;
      }

      if (index === 7) td.className = "revenue-cell";
      tr.appendChild(td);
    });

    table.appendChild(tr);
  });
}

function refreshDashboard() {
  const data = getFilteredData();
  updateKPIs(data);
  updateCharts(data);
  updateTable(data);
}

function exportCSV() {
  const data = getFilteredData();

  if (data.length === 0) {
    alert("No sales records to export.");
    return;
  }

  const headers = [
    "Order ID", "Date", "Product", "Category",
    "Region", "Quantity", "Unit Price", "Revenue", "Customer ID"
  ];

  const rows = data.map(row => [
    row.order_id,
    row.date,
    row.product,
    row.category,
    row.region,
    row.quantity,
    row.price,
    calculateRevenue(row),
    row.customer
  ]);

  const csvCell = value =>
    `"${String(value).replace(/"/g, '""')}"`;

  const csv = [headers, ...rows]
    .map(row => row.map(csvCell).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ecommerce_sales_report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function resetFilters() {
  $("regionFilter").value = "All";
  $("categoryFilter").value = "All";
  $("dateFilter").value = "All";
  $("searchInput").value = "";
  refreshDashboard();
}

document.addEventListener("DOMContentLoaded", () => {
  initializeFilters();

  ["regionFilter", "categoryFilter", "dateFilter"].forEach(id => {
    $(id).addEventListener("change", refreshDashboard);
  });

  $("searchInput").addEventListener("input", refreshDashboard);
  $("downloadBtn").addEventListener("click", exportCSV);
  $("resetBtn").addEventListener("click", resetFilters);

  refreshDashboard();
});
