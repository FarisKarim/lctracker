import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import TodayPage from './pages/TodayPage';
import AddProblemPage from './pages/AddProblemPage';
import LibraryPage from './pages/LibraryPage';
import HistoryPage from './pages/HistoryPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import StatsPage from './pages/StatsPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TodayPage />} />
          <Route path="add" element={<AddProblemPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="problem/:id" element={<ProblemDetailPage />} />
          <Route path="stats" element={<StatsPage />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
