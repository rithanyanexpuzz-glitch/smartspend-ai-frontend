import api from './client';

// ── Auth ─────────────────────────────────────────────────────────────────
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    demoLogin: () => api.post('/auth/demo-login'),
    refresh: () => api.post('/auth/refresh'),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.post('/auth/change-password', data),
};

// ── Dashboard ─────────────────────────────────────────────────────────────
export const dashboardAPI = {
    get: (month) => api.get('/dashboard/', { params: { month } }),
};

// ── Expenses ──────────────────────────────────────────────────────────────
export const expensesAPI = {
    list: (params) => api.get('/expenses/', { params }),
    create: (data) => api.post('/expenses/', data),
    get: (id) => api.get(`/expenses/${id}`),
    update: (id, data) => api.put(`/expenses/${id}`, data),
    delete: (id) => api.delete(`/expenses/${id}`),
    predict: (description) => api.post('/expenses/predict', { description }),
    getCategories: () => api.get('/expenses/categories'),
};

// ── Income ────────────────────────────────────────────────────────────────
export const incomeAPI = {
    list: (params) => api.get('/income/', { params }),
    create: (data) => api.post('/income/', data),
    get: (id) => api.get(`/income/${id}`),
    update: (id, data) => api.put(`/income/${id}`, data),
    delete: (id) => api.delete(`/income/${id}`),
    getCategories: () => api.get('/income/categories'),
};

// ── Budgets ───────────────────────────────────────────────────────────────
export const budgetsAPI = {
    list: (month) => api.get('/budgets/', { params: { month } }),
    createOrUpdate: (data) => api.post('/budgets/', data),
    delete: (id) => api.delete(`/budgets/${id}`),
};

// ── Insights ──────────────────────────────────────────────────────────────
export const insightsAPI = {
    get: () => api.get('/insights/'),
    evaluateModels: () => api.get('/insights/models/evaluate'),
};

// ── Reports ───────────────────────────────────────────────────────────────
export const reportsAPI = {
    downloadCSV: (month, category) =>
        api.get('/reports/csv', { params: { month, category }, responseType: 'blob' }),
    downloadExcel: (month, category) =>
        api.get('/reports/excel', { params: { month, category }, responseType: 'blob' }),
    downloadPDF: (month, category) =>
        api.get('/reports/pdf', { params: { month, category }, responseType: 'blob' }),
    getIncomeVsExpense: (months) =>
        api.get('/reports/income-vs-expense', { params: { months } }),
};

// ── Recurring ─────────────────────────────────────────────────────────────
export const recurringAPI = {
    list: () => api.get('/recurring/'),
    create: (data) => api.post('/recurring/', data),
    update: (id, data) => api.put(`/recurring/${id}`, data),
    delete: (id) => api.delete(`/recurring/${id}`),
    process: (id) => api.post(`/recurring/${id}/process`),
    upcoming: () => api.get('/recurring/upcoming'),
};

// ── Receipts ──────────────────────────────────────────────────────────────
export const receiptsAPI = {
    scan: (formData) =>
        api.post('/receipts/scan', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
};

// ── Notifications ─────────────────────────────────────────────────────────
export const notificationsAPI = {
    list: (limit) => api.get('/notifications/', { params: { limit } }),
    markRead: (id) => api.put(`/notifications/${id}/read`),
    markAllRead: () => api.put('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`),
    clearAll: () => api.delete('/notifications/'),
};

// ── Health ────────────────────────────────────────────────────────────────
export const healthAPI = {
    check: () => api.get('/health'),
};

// ── Savings Goals ─────────────────────────────────────────────────────────
export const goalsAPI = {
    list: () => api.get('/goals/'),
    create: (data) => api.post('/goals/', data),
    update: (id, data) => api.put(`/goals/${id}`, data),
    delete: (id) => api.delete(`/goals/${id}`),
};

// ── AI Financial Advisor & SMS Parser ─────────────────────────────────────
export const advisorAPI = {
    chat: (message) => api.post('/advisor/chat', { message }),
    parseSMS: (sms_text) => api.post('/advisor/parse-sms', { sms_text }),
};

// ── Expense Splits (Splitwise) ─────────────────────────────────────────────
export const splitsAPI = {
    list: () => api.get('/splits/'),
    create: (data) => api.post('/splits/', data),
    toggleSettle: (memberId) => api.put(`/splits/members/${memberId}/toggle-settle`),
    delete: (id) => api.delete(`/splits/${id}`),
};
