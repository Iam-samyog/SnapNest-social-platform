
import MainPage from './MainPage';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CTASection from "./components/CTAsection";
import AuthPages from "./components/AuthPages";
import Dashboard from './Dashboard';

const App = () => {
  return (
     
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/auth" element={<AuthPages />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
     
  
  );
};

export default App;