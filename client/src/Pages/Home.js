import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Assets/Styles/home.css';

const Home = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('seeker');
  const [recruiterIndustry, setRecruiterIndustry] = useState(
    localStorage.getItem('recruiterIndustry') || ''
  );

  const handleSeekerLogin = async () => {
    if (!username.trim()) return setError('Please enter a username');
    
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/genome/${username}`
      );
      
      const seekerData = res.data;
      localStorage.setItem('seeker', JSON.stringify(seekerData));
      if (onLogin) onLogin(seekerData);
      navigate('/seeker');
    } catch (e) {
      setError('Invalid TalentMatch username or API error');
      console.error('Login error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRecruiterStart = () => {
    if (recruiterIndustry.trim()) {
      // Save industry to localStorage
      localStorage.setItem('recruiterIndustry', recruiterIndustry.trim());
      navigate('/recruiter');
    } else {
      setError('Please enter an industry focus');
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="highlight">Connect</span> with Top Talent & Opportunities
          </h1>
          <p className="hero-subtitle">
            TalentMatch brings together job seekers and recruiters in one powerful platform
          </p>
        </div>
        <div className="hero-illustration">
          <div className="network-graphic"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="mode-selector">
          <button 
            className={`mode-tab ${activeTab === 'seeker' ? 'active' : ''}`}
            onClick={() => setActiveTab('seeker')}
          >
            <i className="tab-icon">👤</i> Job Seeker
          </button>
          <button 
            className={`mode-tab ${activeTab === 'recruiter' ? 'active' : ''}`}
            onClick={() => setActiveTab('recruiter')}
          >
            <i className="tab-icon">🔍</i> Recruiter
          </button>
        </div>

        <div className="mode-content">
          {activeTab === 'seeker' ? (
            <div className="seeker-mode">
              <div className="mode-description">
                <h2>Find Your Dream Job</h2>
                <p>Access personalized job recommendations based on your TalentMatch genome profile. Showcase your skills and connect with top companies.</p>
                <div className="benefits">
                  <div className="benefit">
                    <i className="benefit-icon">🎯</i>
                    <span>Personalized matches</span>
                  </div>
                  <div className="benefit">
                    <i className="benefit-icon">💼</i>
                    <span>Global opportunities</span>
                  </div>
                  <div className="benefit">
                    <i className="benefit-icon">🚀</i>
                    <span>Career growth</span>
                  </div>
                </div>
              </div>
              
              <div className="mode-form">
                <h3>Continue as Seeker</h3>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Enter your TalentMatch username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSeekerLogin()}
                  />
                  <i className="input-icon">👤</i>
                </div>
                <button 
                  onClick={handleSeekerLogin}
                  disabled={loading}
                  className="action-button"
                >
                  {loading ? (
                    <span className="spinner"></span>
                  ) : (
                    'Access My Profile'
                  )}
                </button>
                {error && <p className="error">{error}</p>}
              </div>
            </div>
          ) : (
            <div className="recruiter-mode">
              <div className="mode-description">
                <h2>Find Top Talent</h2>
                <p>Discover skilled professionals tailored to your needs. Filter by skills, experience, and location to build your dream team.</p>
                <div className="benefits">
                  <div className="benefit">
                    <i className="benefit-icon">🔎</i>
                    <span>Advanced search</span>
                  </div>
                  <div className="benefit">
                    <i className="benefit-icon">📊</i>
                    <span>Talent analytics</span>
                  </div>
                  <div className="benefit">
                    <i className="benefit-icon">🤝</i>
                    <span>Direct connections</span>
                  </div>
                </div>
              </div>
              
              <div className="mode-form">
                <h3>Start as Recruiter</h3>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Enter your industry focus (e.g. Tech, Finance)"
                    value={recruiterIndustry}
                    onChange={(e) => setRecruiterIndustry(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRecruiterStart()}
                  />
                  <i className="input-icon">🏢</i>
                </div>
                <button 
                  onClick={handleRecruiterStart}
                  className="action-button"
                >
                  Find Talent
                </button>
                {error && <p className="error">{error}</p>}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose TalentMatch</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Global Reach</h3>
            <p>Connect with opportunities and talent from around the world</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Matching</h3>
            <p>Smart algorithms that connect the right people with the right opportunities</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Platform</h3>
            <p>Your data is protected with industry-leading security measures</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <h2>Success Stories</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              "TalentMatch helped me find my perfect remote role in just two weeks. The personalized job matches were spot on!"
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">S</div>
              <div className="author-info">
                <strong>Sarah Johnson</strong>
                <span>Frontend Developer</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              "We found three exceptional candidates for our engineering team through TalentMatch. The talent pool quality is unmatched."
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">M</div>
              <div className="author-info">
                <strong>Michael Chen</strong>
                <span>Tech Recruiter</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-logo">TalentMatch</div>
        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
        <div className="footer-copyright">
          © {new Date().getFullYear()} TalentMatch. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;