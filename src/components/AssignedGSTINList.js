import React, { useEffect, useState } from "react";
import axios from "axios";

const AssignedGSTINList = ({ shared }) => {
  const [gstins, setGstins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGSTINs = async () => {
      try {
        const response = await axios.get("/irisgst/mgmt/user/company/filingbusiness", {
          headers: {
            Authorization: `Bearer ${shared.token}`
          }
        });
        setGstins(response.data || []);
      } catch (err) {
        setError("Failed to fetch assigned GSTINs.");
      } finally {
        setLoading(false);
      }
    };

    fetchGSTINs();
  }, [shared.token]);

  if (loading) return <div>Loading assigned GSTINs...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h3>Assigned GSTINs</h3>
      <ul>
        {gstins.length > 0 ? (
          gstins.map((gstin, index) => <li key={index}>{gstin}</li>)
        ) : (
          <li>No GSTINs assigned.</li>
        )}
      </ul>
    </div>
  );
};

export default AssignedGSTINList;
