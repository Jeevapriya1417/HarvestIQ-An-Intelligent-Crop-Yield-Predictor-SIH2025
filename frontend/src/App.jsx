import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import Welcome from './components/Welcome';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import PredictionForm from './components/PredictionForm';
import Reports from './components/Reports';
import Fields from './components/Fields';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import './i18n';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useApp();
  return user ? children : <Navigate to="/auth" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useApp();
  return !user ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
              <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/prediction" element={<ProtectedRoute><PredictionForm /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/fields" element={<ProtectedRoute><Fields /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
