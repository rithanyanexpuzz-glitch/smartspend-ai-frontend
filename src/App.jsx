import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import IncomePage from './pages/IncomePage.jsx';
import BudgetsPage from './pages/BudgetsPage.jsx';
import InsightsPage from './pages/InsightsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import RecurringPage from './pages/RecurringPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import GoalsPage from './pages/GoalsPage.jsx';
import AdvisorPage from './pages/AdvisorPage.jsx';
import SplitsPage from './pages/SplitsPage.jsx';
import LandingPage from './pages/LandingPage.jsx';

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-900)' }}>
                <div className="spinner spinner-lg" />
            </div>
        );
    }
    return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
    return (
        <Routes>
            <Route path="/welcome" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="income" element={<IncomePage />} />
                <Route path="budgets" element={<BudgetsPage />} />
                <Route path="splits" element={<SplitsPage />} />
                <Route path="goals" element={<GoalsPage />} />
                <Route path="advisor" element={<AdvisorPage />} />
                <Route path="insights" element={<InsightsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="recurring" element={<RecurringPage />} />
                <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}
