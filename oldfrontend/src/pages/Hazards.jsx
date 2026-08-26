import { useEffect, useState } from "react";

function Hazards() {
  const [hazards, setHazards] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/hazards")
      .then((response) => response.json())
      .then((data) => setHazards(data))
      .catch((error) =>
        console.error("Error loading hazards:", error)
      );
  }, []);

  return (
    <div>
      <h1>Hazards</h1>
      <p>All reported hazards</p>

      {hazards.length === 0 ? (
        <p>No hazards found.</p>
      ) : (
        hazards.map((hazard) => (
          <div key={hazard.id} className="hazard-card">
            <h2>{hazard.hazard_type}</h2>

            <p>
              <strong>Severity:</strong> {hazard.severity}
            </p>

            <p>
              <strong>Description:</strong> {hazard.description}
            </p>

            <p>
              <strong>Status:</strong> {hazard.status}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default Hazards;