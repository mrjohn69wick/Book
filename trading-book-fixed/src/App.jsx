import { Route, Switch } from 'wouter';
import { useState, useEffect } from 'react';
import './App.css';

// Import pages
import HomePage from './pages/HomePage';
import LearnPage from './pages/LearnPage';
import LawsPage from './pages/LawsPage';
import GlossaryPage from './pages/GlossaryPage';
import TrainingPage from './pages/TrainingPage';
import SearchPage from './pages/SearchPage';
import ChartPage from './pages/ChartPage';
import MT5Page from './pages/MT5Page';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import { laws } from './data/laws';

// Import components
import Sidebar from './components/Sidebar';
import ProgressBar from './components/ProgressBar';

function App() {
  const [progress, setProgress] = useState({ completed: 0, total: laws.length });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('trading-book-progress');
    if (savedProgress) {
      const parsedProgress = JSON.parse(savedProgress);
      setProgress({ ...parsedProgress, total: laws.length });
    } else {
      setProgress((prev) => ({ ...prev, total: laws.length }));
    }
  }, []);

  return (
    <div className="app" dir="rtl">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <ProgressBar completed={progress.completed} total={progress.total} />
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/learn" component={LearnPage} />
          <Route path="/laws" component={LawsPage} />
          <Route path="/glossary" component={GlossaryPage} />
          <Route path="/training" component={TrainingPage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/chart" component={ChartPage} />
          <Route path="/mt5" component={MT5Page} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </main>
    </div>
  );
}

export default App;
