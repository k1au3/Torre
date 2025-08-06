import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Seeker = () => {
  const [genome, setGenome] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [countryCounts, setCountryCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const initialFetchDone = useRef(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Sample skills for suggestions
  const commonSkills = ['react', 'javascript', 'node.js', 'python', 'sql', 
                        'java', 'angular', 'vue', 'typescript', 'c#',
                        'aws', 'docker', 'kubernetes', 'graphql', 'rest api',
                        'ui design', 'ux design', 'marketing', 'sales', 'product management'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchJobs = async (searchQuery = '') => {
    try {
      setLoading(true);
      setError('');
      
      const keywords = searchQuery.trim() || 
        (genome?.strengths?.length ? 
         genome.strengths.map(s => s.name).join(', ') : 
         'developer');

      const payload = {
        keywords,
        experience: 'potential-to-develop',
        limit: 100
      };

      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/job-search`,
        payload
      );

      setJobs(res.data);
      
      // Create country counts with proper country names
      const counts = {};
      res.data.forEach(job => {
        let country = job.remote ? 'Remote' : job.location || 'Unknown';
        
        // Normalize country names
        if (country.toLowerCase() === 'columbia') country = 'Colombia';
        if (country.toLowerCase() === 'usa') country = 'United States';
        if (country.toLowerCase() === 'uk') country = 'United Kingdom';
        if (country.toLowerCase() === 'united states') country = 'USA';
        
        counts[country] = (counts[country] || 0) + 1;
      });
      
      setCountryCounts(counts);
    } catch (err) {
      setError('Failed to fetch jobs. Please try again.');
      console.error('Job search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const seekerData = localStorage.getItem('seeker');
    if (!seekerData) {
      navigate('/');
      return;
    }
    
    try {
      const parsedData = JSON.parse(seekerData);
      setGenome(parsedData);
      
      if (!initialFetchDone.current) {
        initialFetchDone.current = true;
        fetchJobs();
      }
    } catch {
      localStorage.removeItem('seeker');
      navigate('/');
    }
  }, [navigate]);

  const handleSearch = () => {
    setShowSuggestions(false);
    fetchJobs(query);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Show suggestions when typing
    if (value.length > 1) {
      const filtered = commonSkills.filter(skill => 
        skill.toLowerCase().includes(value.toLowerCase())
      );
      setSearchSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    fetchJobs(suggestion);
  };

  const filteredJobs = jobs.filter(job => {
    let country = job.remote ? 'Remote' : job.location || 'Unknown';
    if (country.toLowerCase() === 'columbia') country = 'Colombia';
    if (country.toLowerCase() === 'united states') country = 'USA';
    
    const type = job.remote ? 'remote' : 'onsite';
    return (!countryFilter || country === countryFilter) && 
           (!typeFilter || type === typeFilter);
  });

  const logout = () => {
    localStorage.removeItem('seeker');
    navigate('/');
  };

  // Sort countries alphabetically
  const sortedCountries = Object.entries(countryCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([country, count]) => ({
      name: country,
      count
    }));

  return (
    <div className="seeker-container">
      {/* Navigation Bar */}
      <nav className="seeker-nav">
  <div className="logo" onClick={() => window.location.reload()}>
    <span className="logo-torre">Talent</span>
    <span className="logo-ai">Match</span>
  </div>
  <div className="profile-nav" ref={dropdownRef}>
    {genome?.person?.picture ? (
      <img 
        src={genome.person.picture} 
        alt="Profile" 
        className="profile-img"
        onClick={() => setProfileDropdown(!profileDropdown)}
      />
    ) : (
      <div 
        className="profile-placeholder"
        onClick={() => setProfileDropdown(!profileDropdown)}
      >
        {genome?.person?.name?.charAt(0) || 'U'}
      </div>
    )}
    {profileDropdown && (
      <div className="profile-dropdown">
        <div className="dropdown-header">
          <h3>{genome?.person?.name || 'User'}</h3>
          <p>{genome?.person?.professionalHeadline || 'Job Seeker'}</p>
        </div>
        <button 
          className="dropdown-item"
          onClick={() => {
            window.open(`https://torre.ai/${genome?.person?.publicId}`, '_blank');
            setProfileDropdown(false);
          }}
        >
          View TalentMatch Profile
        </button>
        <button className="dropdown-item" onClick={logout}>
          Logout
        </button>
      </div>
    )}
  </div>
</nav>

      {/* Main Content */}
      <div className="seeker-main">
        {/* Profile Sidebar */}
        <aside className="profile-sidebar">
          {genome && (
            <div className="profile-card">
              {genome.person?.picture && (
                <img 
                  src={genome.person.picture} 
                  alt={genome.person.name} 
                  className="profile-avatar"
                />
              )}
              <h2>{genome.person?.name}</h2>
              <p className="role">{genome.person?.professionalHeadline}</p>
              <p className="location">
                {genome.person?.location?.name || 'Location not specified'}
              </p>
              <div className="stats">
                <div className="stat">
                  <span>Strengths</span>
                  <strong>{genome.strengths?.length || 0}</strong>
                </div>
                <div className="stat">
                  <span>Experience</span>
                  <strong>{genome.experiences?.length || 0}</strong>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Search & Results */}
        <main className="results-container">
          <div className="search-section">
            <div className="search-bar">
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search skills (e.g. react, sql, marketing...)"
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  onFocus={() => query.length > 1 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                <span className="search-icon">🔍</span>
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="suggestions-dropdown">
                    {searchSuggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="suggestion-item"
                        onMouseDown={() => selectSuggestion(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={handleSearch} 
                disabled={loading}
                className="search-btn"
              >
                {loading ? (
                  <span className="spinner"></span>
                ) : (
                  'Search'
                )}
              </button>
              <button 
                className="mobile-filter-btn"
                onClick={() => setMobileFilters(!mobileFilters)}
              >
                Filters
              </button>
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="results-content">
            <div className={`filters-section ${mobileFilters ? 'mobile-visible' : ''}`}>
              <div className="filter-group">
                <h3>Country</h3>
                <div className="filter-options scrollable">
                  <button
                    className={!countryFilter ? 'active' : ''}
                    onClick={() => setCountryFilter('')}
                  >
                    All Countries
                  </button>
                  {sortedCountries.map((country, index) => (
                    <button
                      key={index}
                      className={country.name === countryFilter ? 'active' : ''}
                      onClick={() => setCountryFilter(country.name)}
                    >
                      {country.name} <span className="count">({country.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h3>Job Type</h3>
                <div className="filter-options">
                  <button
                    className={!typeFilter ? 'active' : ''}
                    onClick={() => setTypeFilter('')}
                  >
                    All Types
                  </button>
                  <button
                    className={typeFilter === 'remote' ? 'active' : ''}
                    onClick={() => setTypeFilter('remote')}
                  >
                    Remote
                  </button>
                  <button
                    className={typeFilter === 'onsite' ? 'active' : ''}
                    onClick={() => setTypeFilter('onsite')}
                  >
                    On-site
                  </button>
                  <button
                    className={typeFilter === 'hybrid' ? 'active' : ''}
                    onClick={() => setTypeFilter('hybrid')}
                  >
                    Hybrid
                  </button>
                </div>
              </div>
              <button 
                className="mobile-close-btn"
                onClick={() => setMobileFilters(false)}
              >
                Close Filters
              </button>
            </div>

            <div className="jobs-list">
              {loading ? (
                <div className="loader">
                  <div className="spinner"></div>
                  <p>Loading jobs...</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="no-results">
                  <h3>No jobs found</h3>
                  <p>Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredJobs.map((job, index) => (
                  <div className="job-card" key={index}>
                    <div className="job-header">
                      <h3>{job.objective}</h3>
                      {job.organization?.picture && (
                        <img 
                          src={job.organization.picture} 
                          alt={job.organization.name} 
                          className="org-logo"
                        />
                      )}
                    </div>
                    {job.organization?.name && (
                      <p className="company">{job.organization.name}</p>
                    )}
                    <div className="job-meta">
                      <span className={`job-type ${job.remote ? 'remote' : 'onsite'}`}>
                        {job.remote ? 'Remote' : 'On-site'}
                      </span>
                      <span className="job-location">
                        {job.remote ? 'Remote' : job.location}
                      </span>
                      {job.compensation?.visible && (
                        <span className="job-salary">
                          ${job.compensation.minAmount?.toLocaleString() || '0'} - ${job.compensation.maxAmount?.toLocaleString() || '0'} {job.compensation.currency}
                        </span>
                      )}
                    </div>
                    {job.skills.length > 0 && (
                      <div className="job-skills">
                        {job.skills.slice(0, 5).map((skill, idx) => (
                          <span key={idx} className="skill-tag">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="job-footer">
                      <button 
                        className="apply-btn"
                        onClick={() => window.open(job.id ? `https://torre.co/jobs/${job.id}` : '#', '_blank')}
                      >
                        View Job
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Seeker;