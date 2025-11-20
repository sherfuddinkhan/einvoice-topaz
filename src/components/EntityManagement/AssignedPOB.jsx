import React, { useState } from "react";
import axios from "axios";

const AssignedPOB = () => {
  const [pobs, setPobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Editable headers & query params
  const [headers, setHeaders] = useState({
    Accept: "application/json",
    "X-Auth-Token": localStorage.getItem("token") || "",
    companyId: localStorage.getItem("companyId") || "",
    product: "topaz",
  });

  const [queryParams, setQueryParams] = useState({
    companyId: localStorage.getItem("companyId") || "",
  });

  const handleHeaderChange = (e) => {
    setHeaders({ ...headers, [e.target.name]: e.target.value });
  };

  const handleParamChange = (e) => {
    setQueryParams({ ...queryParams, [e.target.name]: e.target.value });
  };

  const fetchPOBs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:3001/topaz/pob/assigned", {
        headers,
        params: queryParams,
      });
      setPobs(res.data.response || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "auto" }}>
      <h2>Assigned Places of Business</h2>

      {/* Editable Headers */}
      <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "20px" }}>
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

      {/* Editable Query Params */}
      <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "20px" }}>
        <h4>Query Params (editable)</h4>
        {Object.keys(queryParams).map((key) => (
          <div key={key} style={{ marginBottom: "5px" }}>
            <label style={{ marginRight: "10px" }}>{key}:</label>
            <input
              type="text"
              name={key}
              value={queryParams[key]}
              onChange={handleParamChange}
              style={{ width: "300px" }}
            />
          </div>
        ))}
        <button
          onClick={() => setQueryParams({ ...queryParams, newParam: "" })}
          style={{ marginTop: "5px" }}
        >
          Add Param
        </button>
      </div>

      <button onClick={fetchPOBs} disabled={loading} style={{ marginBottom: "20px" }}>
        {loading ? "Fetching..." : "Fetch Assigned POBs"}
      </button>

      {/* Error Display */}
      {error && (
        <div style={{ background: "#ffe6e6", padding: "10px", marginBottom: "10px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* POB Table */}
      {pobs.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ background: "#f0f0f0" }}>
            <tr>
              <th>Company Name</th>
              <th>GSTIN</th>
              <th>Pincode</th>
              <th>State Code</th>
              <th>Principal?</th>
            </tr>
          </thead>
          <tbody>
            {pobs.map((pob) => (
              <tr key={pob.companyId}>
                <td>{pob.companyName}</td>
                <td>{pob.gstin || pob.gstinno}</td>
                <td>{pob.cmpPincode}</td>
                <td>{pob.stateCode}</td>
                <td>{pob.isPrincipalPob ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No assigned POBs found.</p>
      )}
    </div>
  );
};

export default AssignedPOB;
