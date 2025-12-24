import { useState } from 'react'
import './App.css'

function App() {
  const [activeNav, setActiveNav] = useState('library')
  const [activeCategory, setActiveCategory] = useState('All')

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1 className="sidebar-title">Hadi AI</h1>
        <nav className="nav-list">
          <button
            className={`nav-item ${activeNav === 'library' ? 'active' : ''}`}
            onClick={() => setActiveNav('library')}
            type="button"
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 5.83333L10 1.66667L17.5 5.83333V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V5.83333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.5 17.5V10H12.5V17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Library
          </button>
          <button
            className={`nav-item ${activeNav === 'decks' ? 'active' : ''}`}
            onClick={() => setActiveNav('decks')}
            type="button"
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 3.33333V16.6667M10 3.33333L15 8.33333M10 3.33333L5 8.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.33333 13.3333L3.33333 16.6667C3.33333 17.1087 3.50893 17.5326 3.82149 17.8452C4.13405 18.1577 4.55797 18.3333 5 18.3333L15 18.3333C15.442 18.3333 15.866 18.1577 16.1785 17.8452C16.4911 17.5326 16.6667 17.1087 16.6667 16.6667V13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            My Decks
          </button>
          <button
            className={`nav-item ${activeNav === 'recitation' ? 'active' : ''}`}
            onClick={() => setActiveNav('recitation')}
            type="button"
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.5 7.5C7.5 7.5 8.125 6.25 10 6.25C11.875 6.25 12.5 7.5 12.5 7.5M7.5 10.8333H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Recitation
          </button>
          <button
            className={`nav-item ${activeNav === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveNav('settings')}
            type="button"
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16.25 10C16.1633 10.8333 15.9167 11.6417 15.525 12.3833C15.1333 13.125 14.605 13.7833 13.9667 14.3167L13.8833 14.3833C13.245 14.9167 12.5083 15.3167 11.7167 15.5583C10.925 15.8 10.0917 15.875 9.275 15.7833L9.08333 15.7583C8.26667 15.6667 7.48333 15.4083 6.78333 15.0083C6.08333 14.6083 5.48333 14.075 5.01667 13.4417L4.93333 13.3583C4.46667 12.725 4.14167 12.0083 3.975 12.25C3.80833 11.4917 3.80833 10.7083 3.975 9.95C4.14167 9.19167 4.46667 8.475 4.93333 7.84167L5.01667 7.75833C5.48333 7.125 6.08333 6.59167 6.78333 6.19167C7.48333 5.79167 8.26667 5.53333 9.08333 5.44167L9.275 5.41667C10.0917 5.325 10.925 5.4 11.7167 5.64167C12.5083 5.88333 13.245 6.28333 13.8833 6.81667L13.9667 6.9C14.605 7.43333 15.1333 8.09167 15.525 8.83333C15.9167 9.575 16.1633 10.3833 16.25 11.2167V10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Settings
          </button>
        </nav>
      </aside>

      <main className="content">
        <header className="top-bar">
          <div className="user-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="search-bar">
            <input type="search" placeholder="Search for Texts & Topics..." />
            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.5 17.5L13.875 13.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <button className="my-decks-btn" type="button">My Decks</button>
        </header>

        {activeNav === 'library' ? (
          <div className="library-view">
            <h1 className="library-title">Study Library</h1>
            <div className="category-tabs">
              {['All', 'Hadith', 'Tafsir', 'Fiqh', 'Grammar'].map((cat) => (
                <button
                  key={cat}
                  className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                  type="button"
                >
                  {cat}
                </button>
              ))}
            </div>
            <h2 className="section-title">Recommended</h2>
            <div className="deck-grid">
              <div className="deck-card">
                <div className="deck-pattern pattern-teal">
                  <div className="deck-emblem"></div>
                </div>
                <button className="generate-btn" type="button">Generate Cards</button>
              </div>
              <div className="deck-card">
                <div className="deck-pattern pattern-red">
                  <div className="deck-emblem"></div>
                </div>
                <button className="generate-btn" type="button">Generate Cards</button>
              </div>
            </div>
          </div>
        ) : activeNav === 'decks' ? (
          <div className="review-view">
            <div className="flashcard-container">
              <div className="flashcard">
                <div className="flashcard-header">
                  <span className="flashcard-deck">40 Hadith Nawawi</span>
                  <span className="flashcard-number">Hadith 2/50</span>
                </div>
                <div className="flashcard-content">
                  <div className="arabic-text">الخترم</div>
                  <div className="flashcard-question">What is "Ihsan"?</div>
                  <button className="expand-button" type="button">+</button>
                </div>
              </div>
            </div>
            <div className="rating-buttons">
              <button className="rating-btn again" type="button">Again</button>
              <button className="rating-btn good" type="button">Good</button>
              <button className="rating-btn easy" type="button">Easy</button>
            </div>
            <p className="footer-link">Suggest Correction / Report Error</p>
          </div>
        ) : (
          <div className="library-view">
            <h1 className="library-title">{activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}</h1>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
