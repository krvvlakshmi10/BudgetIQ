from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/ai/insights', methods=['POST'])
def generate_insights():
    try:
        transactions = request.get_json()
        
        if not transactions:
            return jsonify({"insights": ["No data received."]})

        total_income = sum(tx['amount'] for tx in transactions if tx['type'] == "income")
        total_expense = sum(tx['amount'] for tx in transactions if tx['type'] == "expense")
        insights = []

        if total_expense > total_income:
            insights.append("Your expenses exceed your income. Consider budgeting better.")
        else:
            insights.append("Good job! Your income exceeds your expenses.")

        # Existing category insights
        food_expense = sum(tx['amount'] for tx in transactions if tx.get('category') == "Food")
        if food_expense > 2000:
            insights.append("Your food expenses are quite high this month.")

        transport_expense = sum(tx['amount'] for tx in transactions if tx.get('category') == "Transport")
        if transport_expense > 1000:
            insights.append("Transport expenses can be optimized.")

        # New insights
        savings = total_income - total_expense
        if savings < 1000:
            insights.append("Your monthly savings are quite low. Try to save at least 20% of your income.")
        elif savings > 5000:
            insights.append("Great savings this month! Consider investing to grow your wealth.")

        entertainment_expense = sum(tx['amount'] for tx in transactions if tx.get('category') == "Entertainment")
        if entertainment_expense > 1500:
            insights.append("High spending on entertainment detected. Consider cutting back slightly.")

        utilities_expense = sum(tx['amount'] for tx in transactions if tx.get('category') == "Utilities")
        if utilities_expense > 3000:
            insights.append("Utilities expenses are above average. You might want to audit electricity, internet or water usage.")

        # Check for unexpected large expense
        large_expenses = [tx for tx in transactions if tx['type'] == "expense" and tx['amount'] > 5000]
        if large_expenses:
            insights.append("You had some large one-time expenses. Make sure they were essential and accounted for.")

        # Suggest budget planning
        if total_expense > 0:
            top_category = max(
                set(tx.get('category') for tx in transactions if tx['type'] == "expense"),
                key=lambda cat: sum(tx['amount'] for tx in transactions if tx.get('category') == cat),
                default=None
            )
            if top_category:
                insights.append(f"You spent the most on '{top_category}' this month. Consider reviewing this category for savings.")

        return jsonify({"insights": insights})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(port=8000)
