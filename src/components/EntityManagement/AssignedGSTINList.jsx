import React, { useState } from "react";
import axios from "axios";

const AssignedGSTINList = () => {
  const [gstins, setGstins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Editable headers & payload
  const [headers, setHeaders] = useState({
    Accept: "application/json",
    "X-Auth-Token": localStorage.getItem("token") || "",
    companyId: localStorage.getItem("companyId") || "",
    product: "ONYX"
  });

  const [payload, setPayload] = useState({}); // Currently GET request has no payload, but editable

  const handleHeaderChange = (e) => {
    setHeaders({ ...headers, [e.target.name]: e.target.value });
  };

  const handlePayloadChange = (e) => {
    setPayload({ ...payload, [e.target.name]: e.target.value });
  };

  const fetchGSTINs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        "http://localhost:3001/proxy/topaz/mgmt/company/filingbusiness",
        {
          headers,
          params: payload // use params for GET request
        }
      );

      setGstins(res.data.response || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch assigned GSTINs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto" }}>
      <h3>Assigned GSTINs</h3>

      <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h4>Headers (editable)</h4>
        {Object.keys(headers).map((key) => (
          <div key={key} style={{ marginBottom: "5px" }}>
            <label style={{ marginRight: "10px" }}>{key}:</label>
            <input
              type="text"
              name={key}
              value={headers[key]}
              onChange={handleHeaderChange}
              style={{ width: "300px" }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h4>Payload / Query Params (editable)</h4>
        {Object.keys(payload).length === 0 && <div>Currently no payload. You can add key-value pairs below.</div>}
        {Object.keys(payload).map((key) => (
          <div key={key} style={{ marginBottom: "5px" }}>
            <label style={{ marginRight: "10px" }}>{key}:</label>
            <input
              type="text"
              name={key}
              value={payload[key]}
              onChange={handlePayloadChange}
              style={{ width: "300px" }}
            />
          </div>
        ))}
        <button
          onClick={() => setPayload({ ...payload, ["newParam"]: "" })}
          style={{ marginTop: "5px" }}
        >
          Add Param
        </button>
      </div>

      <button onClick={fetchGSTINs} disabled={loading} style={{ marginBottom: "20px" }}>
        {loading ? "Fetching..." : "Fetch GSTINs"}
      </button>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <ul>
        {gstins.length > 0
          ? gstins.map((gstin, index) => <li key={index}>{gstin.gstinno || gstin}</li>)
          : !loading && <li>No GSTINs assigned.</li>}
      </ul>
    </div>
  );
};

export default AssignedGSTINList;
