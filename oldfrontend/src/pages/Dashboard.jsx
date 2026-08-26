import { useEffect, useState } from "react";

function Dashboard() {
  const [locations, setLocations] = useState([]);
  const [hazards, setHazards] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/locations")
      .then((response) => response.json())
      .then((data) => setLocations(data));

    fetch("http://127.0.0.1:8000/hazards")
      .then((response) => response.json())
      .then((data) => setHazards(data));
  }, []);

  return (
    <div className="container-fluid dashboard">

      {/* Header */}
      <div className="mb-5">
        <h1 className="fw-bold">Hazard Intelligence Dashboard</h1>
        <p className="text-muted">
          Monitor hazards and locations in real time.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="row g-4 mb-5">

        <div className="col-md-4">
          <div className="card dashboard-card location-card-3d">
            <div className="card-body">
              <p className="text-muted mb-2">📍 TOTAL LOCATIONS</p>
              <h1 className="fw-bold">{locations.length}</h1>
              <p className="mb-0">Monitored areas</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card dashboard-card hazard-card-3d">
            <div className="card-body">
              <p className="text-muted mb-2">⚠ ACTIVE HAZARDS</p>
              <h1 className="fw-bold">{hazards.length}</h1>
              <p className="mb-0">Reported incidents</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card dashboard-card system-card-3d">
            <div className="card-body">
              <p className="text-muted mb-2">🟢 SYSTEM STATUS</p>
              <h1 className="fw-bold">Online</h1>
              <p className="mb-0">All systems operational</p>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Hazards */}
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-4">
          <h3 className="fw-bold mb-4">Recent Hazards</h3>

          {hazards.length === 0 ? (
            <p className="text-muted">No hazards found.</p>
          ) : (
            <div className="row g-3">
              {hazards
                .slice(-6)
                .reverse()
                .map((hazard) => (
                  <div className="col-md-6" key={hazard.id}>
                    <div className="recent-hazard-card">
                      <h5>⚠ {hazard.hazard_type}</h5>

                      <p className="mb-1">
                        <strong>Severity:</strong>{" "}
                        {hazard.severity}
                      </p>

                      <p className="text-muted mb-0">
                        {hazard.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;