const SpendWise = (() => {
  const EXPENSE_KEY = 'spendwise_expenses';
  const SESSION_KEY = 'spendwise_session';
  const BUDGET_KEY = 'spendwise_budget';

  const qs = (s, p = document) => p.querySelector(s);
  const qsa = (s, p = document) => [...p.querySelectorAll(s)];
  const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  function seed() {
    if (!localStorage.getItem(EXPENSE_KEY)) {
      const today = new Date();
      const d = (daysAgo) => {
        const x = new Date(today);
        x.setDate(x.getDate() - daysAgo);
        return x.toISOString().slice(0, 10);
      };
      const demo = [
        { id: crypto.randomUUID?.() || String(Date.now()+1), title: 'Groceries', amount: 1450, category: 'Food', date: d(1), note: 'Weekly grocery shopping' },
        { id: crypto.randomUUID?.() || String(Date.now()+2), title: 'Metro recharge', amount: 500, category: 'Transport', date: d(2), note: '' },
        { id: crypto.randomUUID?.() || String(Date.now()+3), title: 'Internet bill', amount: 799, category: 'Bills', date: d(5), note: 'Monthly broadband bill' },
        { id: crypto.randomUUID?.() || String(Date.now()+4), title: 'Movie', amount: 620, category: 'Entertainment', date: d(7), note: '' },
        { id: crypto.randomUUID?.() || String(Date.now()+5), title: 'Course subscription', amount: 999, category: 'Education', date: d(11), note: 'Online learning' }
      ];
      localStorage.setItem(EXPENSE_KEY, JSON.stringify(demo));
    }
    if (!localStorage.getItem(BUDGET_KEY)) localStorage.setItem(BUDGET_KEY, '15000');
  }

  function getExpenses() {
    seed();
    try { return JSON.parse(localStorage.getItem(EXPENSE_KEY)) || []; }
    catch { return []; }
  }
  function setExpenses(items) { localStorage.setItem(EXPENSE_KEY, JSON.stringify(items)); }
  function getBudget() { return Number(localStorage.getItem(BUDGET_KEY) || 15000); }
  function setBudget(v) { localStorage.setItem(BUDGET_KEY, String(v)); }
  function isLoggedIn() { return localStorage.getItem(SESSION_KEY) === 'true'; }

  function currentMonthItems(items = getExpenses()) {
    const now = new Date();
    return items.filter(i => {
      const d = new Date(`${i.date}T00:00:00`);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }

  function totals(items = currentMonthItems()) {
    const total = items.reduce((s, i) => s + Number(i.amount), 0);
    return { total, count: items.length };
  }

  function showMessage(el, text, type = 'success') {
    if (!el) return;
    el.textContent = text;
    el.className = `message show ${type}`;
  }

  function setupNavbar() {
    const toggle = qs('.mobile-toggle');
    const links = qs('.nav-links');
    toggle?.addEventListener('click', () => links?.classList.toggle('open'));

    const page = location.pathname.split('/').pop() || 'index.html';
    qsa('.nav-links a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === page) a.classList.add('active');
    });

    const loginBtn = qs('[data-login-btn]');
    const logoutBtn = qs('[data-logout-btn]');
    if (isLoggedIn()) {
      if (loginBtn) loginBtn.textContent = 'Dashboard';
      if (loginBtn) loginBtn.setAttribute('href', 'dashboard.html');
      if (logoutBtn) logoutBtn.style.display = '';
    } else if (logoutBtn) logoutBtn.style.display = 'none';

    logoutBtn?.addEventListener('click', () => {
      localStorage.removeItem(SESSION_KEY);
      location.href = 'index.html';
    });
  }

  function requireAuth() {
    if (document.body.dataset.protected === 'true' && !isLoggedIn()) {
      location.href = 'login.html?next=' + encodeURIComponent(location.pathname.split('/').pop());
      return false;
    }
    return true;
  }

  function initLogin() {
    const form = qs('#loginForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = qs('#email').value.trim();
      const password = qs('#password').value.trim();
      const msg = qs('#loginMessage');
      if (!email || !password) return showMessage(msg, 'Please enter email and password.', 'error');
      localStorage.setItem(SESSION_KEY, 'true');
      localStorage.setItem('spendwise_user_email', email);
      const next = new URLSearchParams(location.search).get('next') || 'dashboard.html';
      showMessage(msg, 'Login successful. Redirecting...', 'success');
      setTimeout(() => location.href = next, 500);
    });
  }

  function initAddExpense() {
    const form = qs('#expenseForm');
    if (!form) return;
    const date = qs('#date');
    if (date && !date.value) date.value = new Date().toISOString().slice(0,10);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const item = {
        id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        title: qs('#title').value.trim(),
        amount: Number(qs('#amount').value),
        category: qs('#category').value,
        date: qs('#date').value,
        note: qs('#note').value.trim()
      };
      const msg = qs('#expenseMessage');
      if (!item.title || !(item.amount > 0) || !item.category || !item.date) {
        return showMessage(msg, 'Please fill all required fields with a valid amount.', 'error');
      }
      const items = getExpenses();
      items.unshift(item);
      setExpenses(items);
      form.reset();
      date.value = new Date().toISOString().slice(0,10);
      showMessage(msg, 'Expense added successfully.', 'success');
    });
  }

  function initDashboard() {
    if (!qs('#dashTotal')) return;
    const all = getExpenses();
    const month = currentMonthItems(all);
    const { total, count } = totals(month);
    const budget = getBudget();
    const remaining = budget - total;

    qs('#dashTotal').textContent = money(total);
    qs('#dashCount').textContent = count;
    qs('#dashBudget').textContent = money(budget);
    qs('#dashRemaining').textContent = money(remaining);

    const tbody = qs('#recentExpenses');
    tbody.innerHTML = '';
    const recent = all.slice().sort((a,b) => b.date.localeCompare(a.date)).slice(0,6);
    if (!recent.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty">No expenses yet.</td></tr>';
    } else {
      recent.forEach(i => tbody.insertAdjacentHTML('beforeend', `
        <tr><td>${escapeHtml(i.title)}</td><td><span class="badge">${escapeHtml(i.category)}</span></td><td>${formatDate(i.date)}</td><td class="amount">${money(i.amount)}</td></tr>`));
    }

    const byCategory = groupByCategory(month);
    const container = qs('#categorySummary');
    container.innerHTML = '';
    const sorted = Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).slice(0,5);
    if (!sorted.length) container.innerHTML = '<div class="empty">No category data yet.</div>';
    else sorted.forEach(([cat, val]) => {
      const pct = total ? Math.round((val/total)*100) : 0;
      container.insertAdjacentHTML('beforeend', `
        <div class="category-item"><strong>${escapeHtml(cat)}</strong><span>${money(val)}</span><small>${pct}% of this month</small></div>`);
    });
  }

  function groupByCategory(items) {
    return items.reduce((acc, i) => { acc[i.category] = (acc[i.category] || 0) + Number(i.amount); return acc; }, {});
  }

  function initHistory() {
    const tbody = qs('#historyBody');
    if (!tbody) return;
    const search = qs('#search');
    const category = qs('#filterCategory');
    const month = qs('#filterMonth');

    const render = () => {
      let items = getExpenses().slice().sort((a,b)=>b.date.localeCompare(a.date));
      const text = search.value.trim().toLowerCase();
      if (text) items = items.filter(i => `${i.title} ${i.category} ${i.note}`.toLowerCase().includes(text));
      if (category.value) items = items.filter(i => i.category === category.value);
      if (month.value) items = items.filter(i => i.date.startsWith(month.value));
      tbody.innerHTML = '';
      if (!items.length) return tbody.innerHTML = '<tr><td colspan="6" class="empty">No matching expenses found.</td></tr>';
      items.forEach(i => tbody.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${formatDate(i.date)}</td><td>${escapeHtml(i.title)}</td><td><span class="badge">${escapeHtml(i.category)}</span></td>
          <td>${escapeHtml(i.note || '-')}</td><td class="amount">${money(i.amount)}</td>
          <td><button class="btn btn-danger" data-delete="${i.id}">Delete</button></td>
        </tr>`));
    };
    [search, category, month].forEach(el => el.addEventListener('input', render));
    tbody.addEventListener('click', e => {
      const btn = e.target.closest('[data-delete]');
      if (!btn) return;
      if (!confirm('Delete this expense?')) return;
      setExpenses(getExpenses().filter(i => i.id !== btn.dataset.delete));
      render();
    });
    render();
  }

  function initStatus() {
    if (!qs('#budgetForm')) return;
    const render = () => {
      const items = currentMonthItems();
      const { total } = totals(items);
      const budget = getBudget();
      const pct = budget > 0 ? Math.min(100, Math.round(total / budget * 100)) : 0;
      qs('#statusSpent').textContent = money(total);
      qs('#statusBudget').textContent = money(budget);
      qs('#statusRemaining').textContent = money(Math.max(0, budget-total));
      qs('#budgetPercent').textContent = `${pct}%`;
      qs('#budgetProgress').style.width = `${pct}%`;
      qs('#budgetInput').value = budget;

      const byCategory = groupByCategory(items);
      const list = qs('#statusCategoryList');
      list.innerHTML = '';
      const sorted = Object.entries(byCategory).sort((a,b)=>b[1]-a[1]);
      if (!sorted.length) list.innerHTML = '<div class="empty">Add expenses to see category status.</div>';
      else sorted.forEach(([cat,val]) => list.insertAdjacentHTML('beforeend', `<div class="category-item"><strong>${escapeHtml(cat)}</strong><span>${money(val)}</span><small>${total ? Math.round(val/total*100) : 0}% of spending</small></div>`));
    };
    qs('#budgetForm').addEventListener('submit', e => {
      e.preventDefault();
      const v = Number(qs('#budgetInput').value);
      if (v > 0) { setBudget(v); render(); showMessage(qs('#budgetMessage'), 'Monthly budget updated.', 'success'); }
      else showMessage(qs('#budgetMessage'), 'Please enter a valid budget.', 'error');
    });
    render();
  }

  function initContact() {
    const form = qs('#contactForm');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      showMessage(qs('#contactMessage'), 'Thanks! Your message has been captured for this demo.', 'success');
      form.reset();
    });
  }

  function formatDate(v) {
    const d = new Date(`${v}T00:00:00`);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function escapeHtml(s='') { return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

  function init() {
    seed();
    if (!requireAuth()) return;
    setupNavbar();
    initLogin();
    initAddExpense();
    initDashboard();
    initHistory();
    initStatus();
    initContact();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', SpendWise.init);
