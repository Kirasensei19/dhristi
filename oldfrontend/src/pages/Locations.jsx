import { useEffect, useState } from "react";

function Locations() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/locations")
      .then((response) => response.json())
      .then((data) => setLocations(data))
      .catch((error) =>
        console.error("Error loading locations:", error)
      );
  }, []);

  return (
    <div className="container-fluid">
      <div className="mb-5">
        <h1 className="fw-bold">📍 Locations</h1>
        <p className="text-muted">
          View all monitored locations in the system.
        </p>
      </div>

      {locations.length === 0 ? (
        <div className="alert alert-secondary">
          No locations found.
        </div>
      ) : (
        <div className="row g-4">
          {locations.map((location) => (
            <div className="col-md-6 col-lg-4" key={location.id}>
              <div className="location-modern-card">
                <div className="location-icon">
                  📍
                </div>

                <h3>{location.name}</h3>

                <p>
                  <strong>State:</strong> {location.state}
                </p>

                <div className="coordinates">
                  <span>Lat: {location.latitude}</span>
                  <span>Long: {location.longitude}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Locations;