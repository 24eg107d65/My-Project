import { useEffect, useState } from "react";
import API from "../../services/api";
import "./VolunteerDashboard.css";

function VolunteerDashboard() {
  const [volunteer, setVolunteer] = useState(null);
  const [available, setAvailable] = useState(false);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const name = localStorage.getItem("name") || "Volunteer";
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadVolunteerData();
  }, []);

  const loadVolunteerData = async () => {
    try {
      if (userId) {
        // Load volunteer profile
        try {
          const profileResponse = await API.get(`/volunteers/${userId}`);
          setVolunteer(profileResponse.data);
        } catch (error) {
          console.log("Volunteer profile not available yet.");
        }

        // Load volunteer requests
        try {
          const requestResponse = await API.get(
            `/requests/volunteer/${userId}`
          );

          setRequests(requestResponse.data || []);
        } catch (error) {
          console.log("No volunteer requests found.");
        }

        // Load notifications
        try {
          const notificationResponse = await API.get(
            `/notifications/user/${userId}`
          );

          setNotifications(notificationResponse.data || []);
        } catch (error) {
          console.log("No notifications found.");
        }
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  const toggleAvailability = async () => {
    try {
      await API.put(
        `/volunteers/${userId}/availability?available=${!available}`
      );

      setAvailable(!available);
    } catch (error) {
      console.error("Availability update failed:", error);

      alert("Unable to update availability.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    window.location.href = "/login";
  };

  const pendingRequests = requests.filter(
    (request) =>
      request.status === "PENDING" ||
      request.status === "ASSIGNED"
  ).length;

  const completedRequests = requests.filter(
    (request) => request.status === "COMPLETED"
  ).length;

  return (
    <div className="volunteer-dashboard">

      {/* Sidebar */}

      <aside className="volunteer-sidebar">

        <div className="volunteer-logo">
          Care<span>Connect</span>
        </div>

        <div className="sidebar-menu">

          <button className="menu-item active">
            🏠
            <span>Dashboard</span>
          </button>

          <button className="menu-item">
            📋
            <span>My Requests</span>
          </button>

          <button className="menu-item">
            🔔
            <span>Notifications</span>
            {notifications.length > 0 && (
              <small>{notifications.length}</small>
            )}
          </button>

          <button className="menu-item">
            👤
            <span>My Profile</span>
          </button>

          <button className="menu-item">
            ⭐
            <span>My Ratings</span>
          </button>

        </div>

        <button className="logout-button" onClick={logout}>
          🚪 Logout
        </button>

      </aside>

      {/* Main Content */}

      <main className="volunteer-main">

        {/* Header */}

        <header className="volunteer-header">

          <div>
            <h1>Volunteer Dashboard</h1>
            <p>
              Welcome back, <strong>{name}</strong>!
            </p>
          </div>

          <div className="header-profile">
            <div className="profile-avatar">
              {name.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{name}</strong>
              <span>Volunteer</span>
            </div>
          </div>

        </header>

        {/* Availability */}

        <section className="availability-card">

          <div>
            <h2>Volunteer Availability</h2>

            <p>
              {available
                ? "You are currently available to help elderly people."
                : "You are currently unavailable for assistance requests."}
            </p>
          </div>

          <button
            className={`availability-button ${
              available ? "available" : "unavailable"
            }`}
            onClick={toggleAvailability}
          >
            <span className="status-dot"></span>

            {available ? "Available" : "Unavailable"}
          </button>

        </section>

        {/* Statistics */}

        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon">📋</div>

            <div>
              <h3>{requests.length}</h3>
              <p>Total Requests</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>

            <div>
              <h3>{pendingRequests}</h3>
              <p>Active Requests</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>

            <div>
              <h3>{completedRequests}</h3>
              <p>Completed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>

            <div>
              <h3>
                {volunteer?.averageRating
                  ? volunteer.averageRating
                  : "—"}
              </h3>
              <p>Rating</p>
            </div>
          </div>

        </section>

        {/* Quick Actions */}

        <section className="dashboard-section">

          <div className="section-title">
            <h2>Quick Actions</h2>
          </div>

          <div className="quick-actions">

            <button className="action-card">
              <span>🔎</span>
              <strong>Find Assistance Requests</strong>
              <p>View requests from elderly users.</p>
            </button>

            <button className="action-card">
              <span>📋</span>
              <strong>My Requests</strong>
              <p>Track your assigned assistance requests.</p>
            </button>

            <button className="action-card">
              <span>👤</span>
              <strong>Update Profile</strong>
              <p>Manage your volunteer information.</p>
            </button>

            <button className="action-card emergency-action">
              <span>🚨</span>
              <strong>Emergency Requests</strong>
              <p>View urgent assistance requests.</p>
            </button>

          </div>

        </section>

        {/* Requests */}

        <section className="dashboard-section">

          <div className="section-title">

            <div>
              <h2>My Assistance Requests</h2>
              <p>Requests assigned to you</p>
            </div>

          </div>

          {requests.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">📋</div>

              <h3>No assistance requests yet</h3>

              <p>
                Once an assistance request is assigned to you,
                it will appear here.
              </p>

            </div>

          ) : (

            <div className="requests-list">

              {requests.map((request) => (

                <div
                  className="request-card"
                  key={request.id}
                >

                  <div className="request-info">

                    <h3>
                      {request.requestType || "Assistance Request"}
                    </h3>

                    <p>
                      {request.description ||
                        "No description available."}
                    </p>

                    <span>
                      📍 {request.location || "Location not provided"}
                    </span>

                  </div>

                  <div className="request-status">

                    <span
                      className={`status-badge ${
                        request.status?.toLowerCase()
                      }`}
                    >
                      {request.status}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default VolunteerDashboard;