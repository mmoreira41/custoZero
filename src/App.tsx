import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Questionnaire } from './pages/Questionnaire';
import { Report } from './pages/Report';
import { AccessDenied } from './pages/AccessDenied';
import ProcessingLogin from './pages/ProcessingLogin';
import Acesso from './pages/Acesso';
import Welcome from './pages/Welcome';
import AccessExpired from './pages/AccessExpired';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/acesso" element={<Acesso />} />
        <Route path="/processando" element={<ProcessingLogin />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/diagnostico" element={<Questionnaire />} />
        <Route path="/relatorio" element={<Report />} />
        <Route path="/acesso-negado" element={<AccessDenied />} />
        <Route path="/acesso-expirado" element={<AccessExpired />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
