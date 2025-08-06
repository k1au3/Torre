import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Recruiter = () => {
  const [skills, setSkills] = useState('');
  const [results, setResults] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [experienceFilter, setExperienceFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showGenomeModal, setShowGenomeModal] = useState(false);
  const [recruiterIndustry, setRecruiterIndustry] = useState(
    localStorage.getItem('recruiterIndustry') || ''
  );
  const dropdownRef = useRef(null);

  // Sample skills for suggestions
  const commonSkills = ['react', 'javascript', 'node.js', 'python', 'sql', 
                        'java', 'angular', 'vue', 'typescript', 'c#',
                        'aws', 'docker', 'kubernetes', 'graphql', 'rest api',
                        'ui design', 'ux design', 'marketing', 'sales', 'product management'];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load talent pool when industry changes
  useEffect(() => {
    if (recruiterIndustry) {
      searchPeople(recruiterIndustry);
    }
  }, [recruiterIndustry]);

  // Save industry to localStorage whenever it changes
  useEffect(() => {
    if (recruiterIndustry) {
      localStorage.setItem('recruiterIndustry', recruiterIndustry);
    }
  }, [recruiterIndustry]);

  const searchPeople = async (searchQuery = '') => {
    try {
      setLoading(true);
      setError('');
      
      // Updated payload to match backend expectations
      const payload = {
        keywords: searchQuery || skills || recruiterIndustry || 'developer',
        experience: experienceFilter || 'potential-to-develop',
        limit: 20
      };

      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/job-search`,
        payload
      );

      if (res.data && res.data.length > 0) {
        setResults(res.data);
      } else {
        setResults([]);
        setError('No results found. Try different search criteria.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                      err.message || 
                      'Failed to search talent. Please try again.';
      setError(errorMsg);
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenome = async (username) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/genome/${username}`
      );
      setActiveProfile(res.data);
      setShowGenomeModal(true);
    } catch (err) {
      setError('Failed to load profile details.');
      console.error('Genome fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSkills(value);
    
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
    setSkills(suggestion);
    setShowSuggestions(false);
    searchPeople(suggestion);
  };

  // Fixed location filtering
  const filteredResults = results.filter(job => {
    if (!locationFilter) return true;
    const locationName = job.location || '';
    return locationName.toLowerCase().includes(locationFilter.toLowerCase());
  });

  const getExperienceLevel = () => {
    switch(experienceFilter) {
      case '1-plus-year': return '1+ years';
      case '2-plus-years': return '2+ years';
      case '5-plus-years': return '5+ years';
      default: return 'Any';
    }
  };

  const getTopSkills = (strengths, count = 4) => {
    if (!strengths || strengths.length === 0) return [];
    
    // Sort by proficiency if available, otherwise by name
    return [...strengths]
      .sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0) || a.name.localeCompare(b.name))
      .slice(0, count);
  };

  const resetIndustry = () => {
    localStorage.removeItem('recruiterIndustry');
    setRecruiterIndustry('');
  };

  return (
    <div className="recruiter-container">
      {/* Navigation Bar */}
      <nav className="recruiter-nav">
        <div className="logo" onClick={() => window.location.reload()}>
          <span className="logo-torre">Talent</span>
          <span className="logo-ai">Match</span>
        </div>
        <div className="recruiter-actions">
          {recruiterIndustry && (
            <button onClick={resetIndustry} className="reset-industry-btn">
              Change Industry
            </button>
          )}
          <button onClick={() => window.location = '/'} className="switch-mode-btn">
            Switch to Seeker Mode
          </button>
        </div>
      </nav>

      {/* Recruiter Industry Setup */}
      {!recruiterIndustry && (
        <div className="industry-setup">
          <div className="setup-card">
            <h2>Welcome, Recruiter!</h2>
            <p>Set your industry focus to see relevant talent</p>
            <div className="industry-input">
              <input
                type="text"
                placeholder="Enter your industry (e.g. Tech, Healthcare, Finance)"
                value={skills}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && setRecruiterIndustry(skills)}
              />
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="suggestions-dropdown" ref={dropdownRef}>
                  {searchSuggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className="suggestion-item"
                      onClick={() => {
                        setRecruiterIndustry(suggestion);
                        selectSuggestion(suggestion);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => {
                if (skills) {
                  setRecruiterIndustry(skills);
                }
              }}
              className="setup-btn"
            >
              Set Industry & Find Talent
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {recruiterIndustry && (
        <div className="recruiter-main">
          {/* Search & Filters */}
          <div className="search-section">
            <div className="search-bar">
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder={`Search talent in ${recruiterIndustry} (e.g. ${recruiterIndustry === 'tech' ? 'react, node.js' : recruiterIndustry === 'healthcare' ? 'nursing, pharmaceuticals' : 'skills'})`}
                  value={skills}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && searchPeople()}
                  onFocus={() => skills.length > 1 && setShowSuggestions(true)}
                />
                <span className="search-icon">🔍</span>
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="suggestions-dropdown" ref={dropdownRef}>
                    {searchSuggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="suggestion-item"
                        onClick={() => selectSuggestion(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => searchPeople()} 
                disabled={loading}
                className="search-btn"
              >
                {loading ? (
                  <span className="spinner"></span>
                ) : (
                  'Search'
                )}
              </button>
            </div>
            
            <div className="filters">
              <div className="filter-group">
                <label>Experience Level</label>
                <select 
                  value={experienceFilter} 
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Any Experience</option>
                  <option value="1-plus-year">1+ years</option>
                  <option value="2-plus-years">2+ years</option>
                  <option value="5-plus-years">5+ years</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="Filter by location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="location-input"
                />
              </div>
            </div>
            
            <div className="current-filters">
              {experienceFilter && (
                <span className="filter-tag">
                  Experience: {getExperienceLevel()}
                  <button onClick={() => setExperienceFilter('')}>×</button>
                </span>
              )}
              {locationFilter && (
                <span className="filter-tag">
                  Location: {locationFilter}
                  <button onClick={() => setLocationFilter('')}>×</button>
                </span>
              )}
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          {/* Results */}
          <div className="results-header">
            <h2>Top Talent in {recruiterIndustry}</h2>
            <p>{filteredResults.length} professionals found</p>
          </div>
          
          <div className="talent-grid">
            {loading ? (
              <div className="loader">
                <div className="spinner"></div>
                <p>Finding talent...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="no-results">
                <h3>No talent found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredResults.map((job, index) => (
                <div 
                  className="talent-card" 
                  key={index}
                  onClick={() => fetchGenome(job.id)}
                >
                  <div className="talent-header">
                    {job.organization.picture && (
                      <img 
                        src={job.organization.picture} 
                        alt={job.organization.name} 
                        className="talent-avatar"
                      />
                    )}
                    <div className="talent-info">
                      <h3>{job.objective}</h3>
                      <p className="headline">{job.organization.name}</p>
                      <p className="location">
                        📍 {job.location}
                      </p>
                    </div>
                  </div>
                  
                  <div className="talent-stats">
                    <div className="stat">
                      <span>Type</span>
                      <strong>{job.type || 'N/A'}</strong>
                    </div>
                    <div className="stat">
                      <span>Remote</span>
                      <strong>{job.remote ? 'Yes' : 'No'}</strong>
                    </div>
                  </div>
                  
                  {job.skills && job.skills.length > 0 && (
                    <div className="talent-skills">
                      {job.skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="skill-tag">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="view-profile-btn">
                    View Job Details
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Genome Modal */}
      {showGenomeModal && activeProfile && (
        <div className="genome-modal">
          <div className="modal-content">
            <button 
              className="close-modal"
              onClick={() => setShowGenomeModal(false)}
            >
              &times;
            </button>
            
            <div className="modal-header">
              {activeProfile.person.picture && (
                <img 
                  src={activeProfile.person.picture} 
                  alt={activeProfile.person.name} 
                  className="profile-avatar"
                />
              )}
              <div>
                <h2>{activeProfile.person.name}</h2>
                <p className="headline">{activeProfile.person.professionalHeadline}</p>
                <p className="location">
                  {activeProfile.person.location?.name || 'Location not specified'}
                </p>
              </div>
            </div>
            
            <div className="modal-section">
              <h3>Professional Summary</h3>
              <p className="summary">
                {activeProfile.person.summaryOfBio || 'No summary available'}
              </p>
            </div>
            
            <div className="modal-section">
              <h3>Top Skills</h3>
              <div className="skills-grid">
                {activeProfile.strengths?.slice(0, 8).map((strength, idx) => (
                  <div key={idx} className="skill-item">
                    <span className="skill-name">{strength.name}</span>
                    <div className="skill-proficiency">
                      <div 
                        className="proficiency-bar"
                        style={{ width: `${strength.proficiency || 50}%` }}
                      ></div>
                      <span>{strength.proficiency || 50}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {activeProfile.experiences?.length > 0 && (
              <div className="modal-section">
                <h3>Experience</h3>
                <div className="experience-list">
                  {activeProfile.experiences.slice(0, 3).map((exp, idx) => (
                    <div key={idx} className="experience-item">
                      <h4>{exp.name}</h4>
                      <p className="company">{exp.organizations?.[0]?.name || 'Unknown company'}</p>
                      <p className="duration">
                        {exp.fromMonth} {exp.fromYear} - {exp.toMonth || 'Present'} {exp.toYear || ''}
                      </p>
                      <p className="responsibilities">{exp.responsibilities}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="modal-footer">
              <button 
                className="contact-btn"
                onClick={() => window.open(`https://torre.ai/${activeProfile.person.publicId}`, '_blank')}
              >
                Contact on TalentMatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recruiter;