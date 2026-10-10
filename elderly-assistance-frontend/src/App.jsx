import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const path = window.location.pathname;

  if (path === "/login") {
    return <Login />;
  }

  if (path === "/register") {
    return <Register />;
  }

  // Temporary dashboard pages
  if (path === "/elderly") {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1>Welcome to Elderly Dashboard</h1>
        <p>You have successfully logged in as an Elderly user.</p>
      </div>
    );
  }

  if (path === "/volunteer") {
    return (<VolunteerDashboard />
    );
  }

  if (path === "/family") {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1>Welcome to Family Dashboard</h1>
        <p>You have successfully logged in as a Family Member.</p>
      </div>
    );
  }

  if (path === "/admin") {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1>Welcome to Admin Dashboard</h1>
        <p>You have successfully logged in as an Administrator.</p>
      </div>
    );
  }

  return <Home />;
}

export default App;