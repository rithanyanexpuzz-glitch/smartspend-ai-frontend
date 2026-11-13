import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

// Register Service Worker for PWA (Installable Mobile App)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}
        >
            <AuthProvider>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#161b22',
                            color: '#c9d1d9',
                            border: '1px solid #30363d',
                            borderRadius: '10px',
                            fontSize: '13.5px',
                            fontFamily: 'Inter, sans-serif',
                        },
                        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#f85149', secondary: '#fff' } },
                    }}
                />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
