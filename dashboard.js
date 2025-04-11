const apiUrl = 'http://localhost:5000/api/transactions';
const userName = localStorage.getItem('userName');
const token = localStorage.getItem('token');

document.getElementById('username').innerText = userName;

const userId = JSON.parse(atob(token.split('.')[1])).userId;

// Add transaction
document.getElementById('transactionForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const transaction = {
    userId,
    type: document.getElementById('type').value,
    amount: parseFloat(document.getElementById('amount').value),
    category: document.getElementById('category').value,
    date: document.getElementById('date').value,
    description: document.getElementById('description').value,
  };

  // Get current balance before proceeding
  const res = await fetch(`${apiUrl}/${userId}`);
  const transactions = await res.json();
  const currentBalance = transactions.reduce((sum, tx) => {
    return sum + (tx.type === 'income' ? tx.amount : -tx.amount);
  }, 0);

  // Block expense if it causes negative balance
  if (transaction.type === 'expense' && (currentBalance - transaction.amount < 0)) {
    alert("❌ Transaction denied: Insufficient Balance :(");
    return;
  }

  await fetch(`${apiUrl}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction)
  });

  alert("✅ Transaction added successfully!");

  document.getElementById('transactionForm').reset();
  loadTransactions();
});

async function loadTransactions() {
  const res = await fetch(`${apiUrl}/${userId}`);
  const data = await res.json();

  // ✅ Total balance from all transactions
  const totalBalance = data.reduce((sum, tx) => {
    return sum + (tx.type === 'income' ? tx.amount : -tx.amount);
  }, 0);
  document.getElementById('balance').innerText = `₹${totalBalance}`;

  // ✅ Display only 5 most recent transactions
  const recentTransactions = data.slice(-5).reverse(); // Last 5
  const transactionList = document.getElementById('transactionList');
  transactionList.innerHTML = '';

  recentTransactions.forEach(tx => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${tx.category}</strong> - ₹${tx.amount} 
      <em>(${tx.type})</em> | ${new Date(tx.date).toLocaleDateString()}<br/>
      ${tx.description || ''}
    `;
    li.style.color = tx.type === 'income' ? 'green' : 'red';
    transactionList.appendChild(li);
  });
}

function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// Load on page load
loadTransactions();
