// ── Shared category constants (single source of truth) ──────────
export const EXPENSE_CATEGORIES = [
    'Food', 'Transport', 'Shopping', 'Bills', 'Healthcare',
    'Entertainment', 'Education', 'Rent', 'Insurance', 'Uncategorized',
];

export const INCOME_CATEGORIES = ['Salary', 'Business', 'Freelance', 'Investment', 'Rental', 'Other'];

// Format currency in INR
export function formatINR(amount) {
    if (amount == null || isNaN(amount)) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

// Format short date
export function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        }).format(new Date(dateStr + 'T00:00:00'));
    } catch { return dateStr; }
}

// Format month YYYY-MM to "Nov 2026"
export function formatMonth(monthStr) {
    if (!monthStr) return '';
    const [y, m] = monthStr.split('-');
    return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' })
        .format(new Date(Number(y), Number(m) - 1, 1));
}

// Get current month YYYY-MM
export function currentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Category colour map
export const CATEGORY_COLORS = {
    Food: '#34d399',
    Transport: '#58a6ff',
    Shopping: '#ffa657',
    Bills: '#bc8cff',
    Healthcare: '#f85149',
    Entertainment: '#f0c040',
    Education: '#4a90a4',
    Rent: '#7c6f57',
    Insurance: '#5a7d9a',
    Uncategorized: '#6b7280',
    Salary: '#10b981',
    Business: '#388bfd',
    Freelance: '#fb8f44',
    Investment: '#a371f7',
    Rental: '#2ea043',
    Other: '#8b949e',
};

export const CATEGORY_ICONS = {
    Food: '🍔',
    Transport: '🚗',
    Shopping: '🛍️',
    Bills: '📄',
    Healthcare: '🏥',
    Entertainment: '🎬',
    Education: '📚',
    Rent: '🏠',
    Insurance: '🛡️',
    Uncategorized: '📁',
    Salary: '💰',
    Business: '💼',
    Freelance: '💻',
    Investment: '📈',
    Rental: '🏠',
    Other: '📁',
};

// Get badge class for alert type
export function alertClass(alert) {
    if (!alert) return 'badge-green';
    if (alert === 'over budget') return 'badge-red';
    if (alert === 'near limit') return 'badge-orange';
    if (alert === 'halfway') return 'badge-yellow';
    return 'badge-green';
}

// Progress bar color
export function progressColor(pct) {
    if (pct >= 100) return 'red';
    if (pct >= 80) return 'orange';
    if (pct >= 50) return 'yellow';
    return 'green';
}

// Download blob file
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Truncate text
export function truncate(text, len = 40) {
    if (!text) return '';
    return text.length > len ? text.slice(0, len) + '…' : text;
}

// Generate month options (last 12)
export function monthOptions() {
    const opts = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        opts.push({ value, label: formatMonth(value) });
    }
    return opts;
}
