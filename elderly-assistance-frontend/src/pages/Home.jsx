import "./Home.css";

function Home() {
  const goToLogin = () => {
    window.location.href = "/login";
  };

  const goToRegister = () => {
    window.location.href = "/register";
  };

  return (
    <div className="home">

      {/* Navigation */}
      <nav className="navbar">

        <div className="logo">
          <span>🌿</span> CareConnect
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#how">How It Works</a>
        </div>

        <div className="nav-buttons">

          <button
            className="login-btn"
            onClick={goToLogin}
          >
            Login
          </button>

          <button
            className="register-btn"
            onClick={goToRegister}
          >
            Get Started
          </button>

        </div>

      </nav>


      {/* Hero Section */}
      <section className="hero" id="home">

        <div className="hero-content">

          <div className="hero-badge">
            💚 Community Care • Trusted Support
          </div>

          <h1>
            Caring for Our
            <span> Elders, </span>
            Together.
          </h1>

          <p>
            A trusted community platform connecting elderly people
            with verified volunteers and caregivers for everyday
            assistance, companionship, and emergency support.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-btn"
              onClick={goToLogin}
            >
              Request Assistance →
            </button>

            <button
              className="secondary-btn"
              onClick={goToRegister}
            >
              Become a Volunteer
            </button>

          </div>

          <div className="hero-stats">

            <div>
              <strong>500+</strong>
              <span>Volunteers</span>
            </div>

            <div>
              <strong>1,200+</strong>
              <span>Requests Helped</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Emergency Support</span>
            </div>

          </div>

        </div>


        {/* Help Card */}
        <div className="hero-card">

          <div className="heart-icon">
            ❤️
          </div>

          <h3>We're Here to Help</h3>

          <p>
            Need assistance with something today?
          </p>

          <div className="help-item">
            💊
            <span>Medicine Pickup</span>
          </div>

          <div className="help-item">
            🛒
            <span>Grocery Assistance</span>
          </div>

          <div className="help-item">
            🚗
            <span>Transportation</span>
          </div>

          <div className="help-item">
            🏥
            <span>Hospital Visit</span>
          </div>

          <button
            className="emergency-btn"
            onClick={goToLogin}
          >
            🚨 Emergency Assistance
          </button>

        </div>

      </section>


      {/* About Section */}
      <section className="about" id="about">

        <div className="section-heading">

          <span>WHY CARECONNECT?</span>

          <h2>
            Support that makes everyday life easier.
          </h2>

          <p>
            We bring elderly people, trusted volunteers, and
            authorized family members together in one simple platform.
          </p>

        </div>


        <div className="feature-grid">

          <div className="feature-card">
            <div>🛡️</div>

            <h3>
              Verified Volunteers
            </h3>

            <p>
              Connect with verified volunteers who are ready to help.
            </p>
          </div>


          <div className="feature-card">
            <div>📍</div>

            <h3>
              Nearby Assistance
            </h3>

            <p>
              Find suitable assistance based on availability and location.
            </p>
          </div>


          <div className="feature-card">
            <div>🔔</div>

            <h3>
              Real-Time Updates
            </h3>

            <p>
              Track your assistance request and receive notifications.
            </p>
          </div>


          <div className="feature-card">
            <div>🚨</div>

            <h3>
              Emergency Support
            </h3>

            <p>
              Urgent requests can be prioritized for faster assistance.
            </p>
          </div>

        </div>

      </section>


      {/* Services Section */}
      <section className="services" id="services">

        <div className="section-heading">

          <span>OUR SERVICES</span>

          <h2>
            Help when you need it most.
          </h2>

        </div>


        <div className="service-grid">

          <div className="service-card">

            <span>💊</span>

            <h3>
              Medicine Pickup
            </h3>

            <p>
              Get medicines collected and delivered from nearby pharmacies.
            </p>

          </div>


          <div className="service-card">

            <span>🛒</span>

            <h3>
              Grocery Assistance
            </h3>

            <p>
              Request help with essential grocery shopping.
            </p>

          </div>


          <div className="service-card">

            <span>🚗</span>

            <h3>
              Transportation
            </h3>

            <p>
              Find assistance for important local journeys.
            </p>

          </div>


          <div className="service-card">

            <span>🏥</span>

            <h3>
              Hospital Visits
            </h3>

            <p>
              Get support when visiting hospitals or medical facilities.
            </p>

          </div>


          <div className="service-card">

            <span>📱</span>

            <h3>
              Digital Support
            </h3>

            <p>
              Receive help with phones, apps, and digital services.
            </p>

          </div>


          <div className="service-card">

            <span>🤝</span>

            <h3>
              Other Assistance
            </h3>

            <p>
              Request help for other essential everyday tasks.
            </p>

          </div>

        </div>

      </section>


      {/* How It Works */}
      <section className="how-section" id="how">

        <div className="section-heading">

          <span>HOW IT WORKS</span>

          <h2>
            Getting help is simple.
          </h2>

        </div>


        <div className="steps">

          <div className="step">

            <div className="step-number">
              01
            </div>

            <h3>
              Create a Request
            </h3>

            <p>
              Tell us what kind of assistance you need.
            </p>

          </div>


          <div className="step">

            <div className="step-number">
              02
            </div>

            <h3>
              Find a Volunteer
            </h3>

            <p>
              A suitable available volunteer can be assigned.
            </p>

          </div>


          <div className="step">

            <div className="step-number">
              03
            </div>

            <h3>
              Track Assistance
            </h3>

            <p>
              Follow your request until the task is completed.
            </p>

          </div>


          <div className="step">

            <div className="step-number">
              04
            </div>

            <h3>
              Give Feedback
            </h3>

            <p>
              Rate the assistance and help improve the community.
            </p>

          </div>

        </div>

      </section>


      {/* Emergency Section */}
      <section className="emergency-section">

        <div>

          <span className="emergency-label">
            🚨 EMERGENCY SUPPORT
          </span>

          <h2>
            When every second matters.
          </h2>

          <p>
            Urgent assistance requests can receive priority
            and authorized contacts can be notified.
          </p>

        </div>


        <button
          className="emergency-large-btn"
          onClick={goToLogin}
        >
          Get Emergency Help
        </button>

      </section>


      {/* Footer */}
      <footer>

        <div className="footer-logo">
          🌿 CareConnect
        </div>

        <p>
          Building a safer and more caring community for everyone.
        </p>

        <div className="footer-copy">
          © 2026 CareConnect. Elderly Assistance Network.
        </div>

      </footer>

    </div>
  );
}

export default Home;