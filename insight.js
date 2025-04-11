document.addEventListener("DOMContentLoaded", () => {
  const incomeBox = document.getElementById("reportIncome");
  const expenseBox = document.getElementById("reportExpenses");
  const savingsBox = document.getElementById("reportSavings");
  const btn = document.getElementById("generateInsightsBtn");
  const insightBox = document.getElementById("insightsContainer");

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const userId = JSON.parse(atob(token.split('.')[1])).userId;

  async function loadFinancialSummary() {
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/${userId}`);
      const transactions = await res.json();

      let totalIncome = 0;
      let totalExpenses = 0;

      transactions.forEach(tx => {
        if (tx.type === "income") totalIncome += tx.amount;
        else if (tx.type === "expense") totalExpenses += tx.amount;
      });

      const savings = totalIncome - totalExpenses;

      incomeBox.innerText = `₹${totalIncome}`;
      expenseBox.innerText = `₹${totalExpenses}`;
      savingsBox.innerText = `₹${savings}`;

      window.currentTransactions = transactions;

    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  }

  btn.addEventListener("click", async () => {
    try {
      const aiRes = await fetch("http://localhost:8000/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(window.currentTransactions || [])
      });
  
      const data = await aiRes.json();
  
      if (data.insights && data.insights.length > 0) {
        insightBox.innerHTML = "<strong>AI Insights:</strong><ul>" +
          data.insights.map(i => `<li>${i}</li>`).join('') +
          "</ul>";
      } else {
        insightBox.innerHTML = "No insights available.";
      }
  
      insightBox.classList.remove("d-none");
    } catch (err) {
      console.error("Error getting AI insights:", err);
      insightBox.innerText = "Failed to get insights. Try again.";
      insightBox.classList.remove("d-none");
    }
  });

  loadFinancialSummary();
});
