import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Questionnaire } from './pages/Questionnaire';
import { Report } from './pages/Report';
import { AccessDenied } from './pages/AccessDenied';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/diagnostico" element={<Questionnaire />} />
        <Route path="/relatorio" element={<Report />} />
        <Route path="/acesso-negado" element={<AccessDenied />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
