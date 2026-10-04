import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import RingQueue from './pages/RingQueue';
import RingCaseView from './pages/RingCaseView';
import ClosedCases from './pages/ClosedCases';
import TrustScreen from './pages/TrustScreen';
import SimulateScreen from './pages/SimulateScreen';
import { FraudMeshProvider } from './context/FraudMeshContext';

export default function App() {
  return (
    <FraudMeshProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', minHeight: '100vh', background: '#080c16' }}>
          <Sidebar />
          <main style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
            <Routes>
              <Route path="/" element={<RingQueue />} />
              <Route path="/rings/:ringId" element={<RingCaseView />} />
              <Route path="/cases" element={<ClosedCases />} />
              <Route path="/trust" element={<TrustScreen />} />
              <Route path="/simulate" element={<SimulateScreen />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </FraudMeshProvider>
  );
}
