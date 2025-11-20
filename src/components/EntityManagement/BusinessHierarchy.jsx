import React, { useState } from "react";
import axios from "axios";

const BusinessHierarchy = () => {
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Editable headers & query params
  const [headers, setHeaders] = useState({
    "X-Auth-Token": localStorage.getItem("token") || "",
    companyId: localStorage.getItem("companyId") || "",
    product: "topaz",
    Accept: "application/json",
  });

  const [queryParams, setQueryParams] = useState({
    companyid: localStorage.getItem("companyId") || "",
  });

  const handleHeaderChange = (e) => {
    setHeaders({ ...headers, [e.target.name]: e.target.value });
  };

  const handleParamChange = (e) => {
    setQueryParams({ ...queryParams, [e.target.name]: e.target.value });
  };

  const fetchHierarchy = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:3001/proxy/mgmt/businessHierarchy", {
        headers,
        params: queryParams,
      });
      setHierarchy(res.data.response || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto" }}>
      <h2>Business Hierarchy</h2>

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

      <button onClick={fetchHierarchy} disabled={loading} style={{ marginBottom: "20px" }}>
        {loading ? "Fetching..." : "Fetch Hierarchy"}
      </button>

      {error && (
        <div style={{ background: "#ffe6e6", padding: "10px", marginBottom: "10px" }}>
          <h4>Error:</h4>
          <pre>{error}</pre>
        </div>
      )}

      {hierarchy.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Company Name</th>
              <th>GSTIN</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {hierarchy.map((item) => (
              <tr key={item.id}>
                <td>{item.companyname}</td>
                <td>{item.gstin}</td>
                <td>{item.roleName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No business hierarchy found.</p>
      )}
    </div>
  );
};

export default BusinessHierarchy;
