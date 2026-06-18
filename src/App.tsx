import React from 'react';
import { AppProvider, useApp } from './store/AppContext';
import Navbar from './components/Navbar';
import TasksPage from './pages/TasksPage';
import ReviewPage from './pages/ReviewPage';
import ProducerPage from './pages/ProducerPage';

const AppContent: React.FC = () => {
  const { currentPage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'tasks':
        return <TasksPage />;
      case 'review':
        return <ReviewPage />;
      case 'producer':
        return <ProducerPage />;
      default:
        return <TasksPage />;
    }
  };

  return (
    <div className="min-h-screen bg-horror-bg">
      <Navbar />
      {renderPage()}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
