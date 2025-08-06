import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Pages/Home';
import Seeker from './Pages/Seeker';
import Recruiter from './Pages/Recruiter';
import { useState, useEffect } from 'react';

const App = () => {
  const [seeker, setSeeker] = useState(null);
  const [recruiterIndustry, setRecruiterIndustry] = useState('');
  
  useEffect(() => {
    // Check for existing seeker authentication
    const seekerData = localStorage.getItem('seeker');
    if (seekerData) {
      setSeeker(JSON.parse(seekerData));
    }
    
    // Check for existing recruiter industry preference
    const savedIndustry = localStorage.getItem('recruiterIndustry');
    if (savedIndustry) {
      setRecruiterIndustry(savedIndustry);
    }
    
    // Listen for storage events (changes from other tabs)
    const handleStorageChange = () => {
      const updatedSeeker = localStorage.getItem('seeker');
      setSeeker(updatedSeeker ? JSON.parse(updatedSeeker) : null);
      
      const updatedIndustry = localStorage.getItem('recruiterIndustry');
      if (updatedIndustry !== recruiterIndustry) {
        setRecruiterIndustry(updatedIndustry || '');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update localStorage when recruiterIndustry changes
  useEffect(() => {
    if (recruiterIndustry) {
      localStorage.setItem('recruiterIndustry', recruiterIndustry);
    }
  }, [recruiterIndustry]);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <Home 
              onLogin={setSeeker} 
              onSetIndustry={setRecruiterIndustry} 
              initialIndustry={recruiterIndustry}
            />
          } 
        />
        <Route 
          path="/seeker" 
          element={seeker ? <Seeker /> : <Navigate to="/" />} 
        />
        <Route 
          path="/recruiter" 
          element={
            <Recruiter 
              initialIndustry={recruiterIndustry} 
              onIndustryChange={setRecruiterIndustry}
            />
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;