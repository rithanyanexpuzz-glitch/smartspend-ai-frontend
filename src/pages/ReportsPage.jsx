import { useState, useEffect, useCallback } from 'react';
import { FileText, Download, BarChart2, RefreshCw, FileSpreadsheet, File } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reportsAPI } from '../api';
import { formatINR, formatMonth, downloadBlob, monthOptions } from '../utils/helpers.js';
import toast from 'react-hot-toast';

const EXPENSE_CATEGORIES = [
    'Food', 'Transport', 'Shopping', 'Bills', 'Healthcare',
    'Entertainment', 'Education', 'Rent', 'Insurance', 'Uncategorized',
];

const MONTHS = monthOptions();

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'var(--bg-750)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
            <div style={{ color: 'var(--text-200)', marginBottom: 6 }}>{label}</div>
            {payload.map(p => (
                <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
                    {p.name}: <strong>{formatINR(p.value)}</strong>
                </div>
            ))}
        </div>
    );
}

function DownloadCard({ icon: Icon, title, description, onDownload, loading, color, id }) {
    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: `${color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={22} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-50)' }}>{title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-300)', marginTop: 2 }}>{description}</div>
                </div>
            </div>
            <button
                id={id}
                className="btn btn-primary btn-sm"
                onClick={onDownload}
                disabled={loading}
                style={{ alignSelf: 'flex-start' }}
            >
                {loading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <Download size={13} />}
                {loading ? 'Generating…' : 'Download'}
            </button>
        </div>
    );
}

export default function ReportsPage() {
    const [filters, setFilters] = useState({ month: MONTHS[0].value, category: '' });
    const [trendMonths, setTrendMonths] = useState(6);
    const [trendData, setTrendData] = useState([]);
    const [loadingTrend, setLoadingTrend] = useState(false);
    const [downloading, setDownloading] = useState({ csv: false, excel: false, pdf: false });

    const loadTrendData = useCallback(async () => {
        setLoadingTrend(true);
        try {
            const { data } = await reportsAPI.getIncomeVsExpense(trendMonths);
            // Map month string to short label
            const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const mapped = (data.data || data || []).map(row => ({
                ...row,
                label: row.month ? `${SHORT[parseInt(row.month.split('-')[1]) - 1]} ${row.month.split('-')[0]}` : row.label || row.month,
            }));
            setTrendData(mapped);
        } catch {
            toast.error('Failed to load income vs expense data.');
        } finally {
            setLoadingTrend(false);
        }
    }, [trendMonths]);

    useEffect(() => { loadTrendData(); }, [loadTrendData]);

    const handleDownload = async (type) => {
        setDownloading(p => ({ ...p, [type]: true }));
        try {
            let resp;
            const { month, category } = filters;
            if (type === 'csv') resp = await reportsAPI.downloadCSV(month, category || undefined);
            else if (type === 'excel') resp = await reportsAPI.downloadExcel(month, category || undefined);
            else resp = await reportsAPI.downloadPDF(month, category || undefined);

            const ext = { csv: 'csv', excel: 'xlsx', pdf: 'pdf' }[type];
            const label = formatMonth(month).replace(' ', '-');
            downloadBlob(resp.data, `smartspend-${type}-${label}.${ext}`);
            toast.success(`${type.toUpperCase()} report downloaded!`);
        } catch (err) {
            const msg = err.response?.data?.error || `Failed to generate ${type.toUpperCase()} report.`;
            toast.error(msg);
        } finally {
            setDownloading(p => ({ ...p, [type]: false }));
        }
    };

    const netData = trendData.map(r => ({
        ...r,
        net: (parseFloat(r.income) || 0) - (parseFloat(r.expenses) || 0),
    }));

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h1>Reports</h1>
                        <p>Download detailed financial reports and view historical trends</p>
                    </div>
                </div>
            </div>

            {/* Report Filters */}
            <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
                <div style={{ marginBottom: 10 }}>
                    <div className="card-title">Report Filters</div>
                    <div className="card-subtitle">Select month and category for your download</div>
                </div>
                <div className="filters-bar">
                    <div className="select-arrow" style={{ flex: '0 0 200px' }}>
                        <select
                            className="select"
                            id="report-month-filter"
                            value={filters.month}
                            onChange={e => setFilters(p => ({ ...p, month: e.target.value }))}
                        >
                            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </div>
                    <div className="select-arrow" style={{ flex: '0 0 200px' }}>
                        <select
                            className="select"
                            id="report-cat-filter"
                            value={filters.category}
                            onChange={e => setFilters(p => ({ ...p, category: e.target.value }))}
                        >
                            <option value="">All Categories</option>
                            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-300)', marginLeft: 4 }}>
                        Reporting for: <strong style={{ color: 'var(--text-100)' }}>{formatMonth(filters.month)}</strong>
                        {filters.category && <> · Category: <strong style={{ color: 'var(--text-100)' }}>{filters.category}</strong></>}
                    </div>
                </div>
            </div>

            {/* Download Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 28 }}>
                <DownloadCard
                    id="download-csv-btn"
                    icon={FileText}
                    title="CSV Report"
                    description="Plain text spreadsheet — open in Excel, Google Sheets, or any CSV viewer."
                    onDownload={() => handleDownload('csv')}
                    loading={downloading.csv}
                    color="var(--emerald-400)"
                />
                <DownloadCard
                    id="download-excel-btn"
                    icon={FileSpreadsheet}
                    title="Excel Report"
                    description="Styled .xlsx workbook with headers, alternating rows, and category totals."
                    onDownload={() => handleDownload('excel')}
                    loading={downloading.excel}
                    color="var(--blue-400)"
                />
                <DownloadCard
                    id="download-pdf-btn"
                    icon={File}
                    title="PDF Report"
                    description="Professionally formatted PDF with ₹ INR formatting, summary tables, and charts."
                    onDownload={() => handleDownload('pdf')}
                    loading={downloading.pdf}
                    color="var(--purple-400)"
                />
            </div>

            {/* Income vs Expense Trend */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <BarChart2 size={15} color="var(--blue-400)" />
                            Income vs Expenses Trend
                        </div>
                        <div className="card-subtitle">Historical comparison over the selected period</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div className="select-arrow">
                            <select
                                className="select"
                                id="trend-months-select"
                                value={trendMonths}
                                onChange={e => setTrendMonths(Number(e.target.value))}
                                style={{ width: 140 }}
                            >
                                <option value={3}>Last 3 months</option>
                                <option value={6}>Last 6 months</option>
                                <option value={12}>Last 12 months</option>
                            </select>
                        </div>
                        <button className="btn btn-ghost btn-sm btn-icon" id="trend-refresh-btn" onClick={loadTrendData} title="Refresh">
                            <RefreshCw size={14} style={{ animation: loadingTrend ? 'spin 0.7s linear infinite' : 'none' }} />
                        </button>
                    </div>
                </div>

                {loadingTrend ? (
                    <div className="loading-overlay" style={{ minHeight: 280 }}>
                        <div className="spinner spinner-lg" />
                        <span>Loading trend data…</span>
                    </div>
                ) : trendData.length === 0 ? (
                    <div className="empty-state" style={{ padding: '40px 0' }}>
                        <div className="empty-state-icon">📈</div>
                        <h3>No historical data yet</h3>
                        <p>Add income and expenses to see your financial trend</p>
                    </div>
                ) : (
                    <>
                        <div className="chart-container-lg">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={netData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="rpt-incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="rpt-expGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f85149" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#f85149" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,54,61,0.5)" />
                                    <XAxis dataKey="label" tick={{ fill: 'var(--text-300)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: 'var(--text-300)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-200)' }} />
                                    <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fill="url(#rpt-incomeGrad)" />
                                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f85149" strokeWidth={2} fill="url(#rpt-expGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Summary Table */}
                        <div style={{ marginTop: 20 }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Month</th>
                                            <th style={{ textAlign: 'right' }}>Income</th>
                                            <th style={{ textAlign: 'right' }}>Expenses</th>
                                            <th style={{ textAlign: 'right' }}>Net Balance</th>
                                            <th style={{ textAlign: 'right' }}>Savings Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {netData.map(row => {
                                            const income = parseFloat(row.income) || 0;
                                            const expenses = parseFloat(row.expenses) || 0;
                                            const net = income - expenses;
                                            const savingsPct = income > 0 ? ((net / income) * 100).toFixed(1) : '—';
                                            return (
                                                <tr key={row.label}>
                                                    <td style={{ fontWeight: 600, color: 'var(--text-100)' }}>{row.label}</td>
                                                    <td style={{ textAlign: 'right' }}><span className="amount-income">{formatINR(income)}</span></td>
                                                    <td style={{ textAlign: 'right' }}><span className="amount-expense">{formatINR(expenses)}</span></td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <span className={net >= 0 ? 'amount-income' : 'amount-expense'}>{formatINR(net)}</span>
                                                    </td>
                                                    <td style={{ textAlign: 'right', fontSize: 12, color: savingsPct !== '—' && parseFloat(savingsPct) >= 20 ? 'var(--emerald-400)' : 'var(--text-200)' }}>
                                                        {savingsPct !== '—' ? `${savingsPct}%` : '—'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
