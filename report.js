document.addEventListener("DOMContentLoaded", () => {
  const incomeEl = document.getElementById("reportIncome");
  const expenseEl = document.getElementById("reportExpenses");
  const savingsEl = document.getElementById("reportSavings");

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const userId = JSON.parse(atob(token.split('.')[1])).userId;

  let incomeChart = null;
  let expenseChart = null;

  async function loadReportData() {
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/${userId}`);
      const transactions = await res.json();

      let totalIncome = 0;
      let totalExpenses = 0;
      const incomeCategories = {};
      const expenseCategories = {};

      transactions.forEach(tx => {
        let category = tx.category || "Uncategorized";
        category = category.trim().toLowerCase();
        category = category.charAt(0).toUpperCase() + category.slice(1);

        if (tx.type === "income") {
          totalIncome += tx.amount;
          incomeCategories[category] = (incomeCategories[category] || 0) + tx.amount;
        } else if (tx.type === "expense") {
          totalExpenses += tx.amount;
          expenseCategories[category] = (expenseCategories[category] || 0) + tx.amount;
        }
      });

      const savings = totalIncome - totalExpenses;

      incomeEl.innerText = `₹${totalIncome}`;
      expenseEl.innerText = `₹${totalExpenses}`;
      savingsEl.innerText = `₹${savings}`;

      renderExpenseChart(expenseCategories);
      renderIncomeChart(incomeCategories);

    } catch (err) {
      console.error("Error loading report data:", err);
    }
  }

  function renderExpenseChart(data) {
    const ctx = document.getElementById("expenseChart").getContext("2d");
    if (expenseChart) expenseChart.destroy();

    expenseChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: "Expenses",
          data: Object.values(data),
          backgroundColor: generateColors(Object.keys(data).length),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Expense Breakdown by Category"
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  function renderIncomeChart(data) {
    const ctx = document.getElementById("incomeChart").getContext("2d");
    if (incomeChart) incomeChart.destroy();

    incomeChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: "Income",
          data: Object.values(data),
          backgroundColor: generateColors(Object.keys(data).length),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Income Breakdown by Category"
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Categories"
            },
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 0
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Amount (₹)"
            }
          }
        }
      }
    });
  }

  function generateColors(count) {
    const baseColors = [
      '#FF6384', '#36A2EB', '#FFCE56',
      '#4BC0C0', '#9966FF', '#FF9F40',
      '#B19CD9', '#77DD77', '#E7E9ED'
    ];
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  }

  loadReportData();
});
