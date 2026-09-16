# Reusable Prompt: SpendWise Multi-Page Expense Tracker

Create a complete responsive **multi-page Expense Tracker website named “SpendWise”** using only **HTML5, CSS3 and vanilla JavaScript**. The project must be easy to open and run inside **VS Code with Live Server**.

Use this exact project structure:

```text
SpendWise/
├── index.html          ← Home Page
├── login.html          ← Login
├── dashboard.html      ← Dashboard
├── add-expense.html    ← Add Expense
├── history.html        ← Expense History
├── status.html         ← Expense Status / Budget
├── about.html          ← About
├── contact.html        ← Contact
├── style.css           ← Shared CSS for all pages
└── script.js           ← Shared JavaScript
```

Requirements:

- Every page must be a separate HTML file and all pages must be connected through a consistent navbar.
- Use a modern, clean and colorful responsive UI suitable for desktop and mobile.
- Do not use a backend. Use `localStorage` so data remains available while navigating between pages.
- `login.html`: demo login; accept a valid email and any password, then store a session in localStorage and redirect to dashboard.
- Protect Dashboard, Add Expense, History and Status pages. If not logged in, redirect to Login.
- `add-expense.html`: fields for expense title, amount, category, date and optional note. Save the expense in localStorage.
- `dashboard.html`: show current-month total spending, number of expense entries, monthly budget, remaining money, recent expenses and top spending categories.
- `history.html`: show all expenses in a table with search, category filter, month filter and Delete button.
- `status.html`: let the user set a monthly budget; show amount spent, budget, remaining amount, budget percentage, progress bar and category breakdown.
- `about.html`: explain how the project works, especially the connection between separate HTML pages and shared CSS/JS.
- `contact.html`: include a frontend-only contact form with a success message.
- `style.css`: shared professional styling, cards, buttons, forms, tables, badges, progress bar, navbar, responsive breakpoints and mobile menu.
- `script.js`: shared functions for localStorage expenses, session handling, page protection, navbar/mobile menu, expense CRUD, monthly calculations, budget, filters and contact demo.
- Use Indian Rupee (₹) formatting.
- Include a few demo expenses on first run so Dashboard does not look empty.
- No external libraries are required.
- Code should be well organized, readable and presentation-ready.

Finally provide simple VS Code run instructions using Live Server.
