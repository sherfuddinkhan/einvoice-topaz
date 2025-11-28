import React, { useState, useEffect } from "react";
import axios from "axios";

const STORAGE_KEY = "iris_einvoice_shared_config";
const LOGIN_RESPONSE_KEY = "iris_login_data";
const DEFAULT_PROXY = "http://localhost:3001/proxy/mgmt/pob/list";

const AssignedPOB = () => {
  const savedLogin = JSON.parse(localStorage.getItem(LOGIN_RESPONSE_KEY) || "{}");

  const [headers, setHeaders] = useState({
    Accept: "application/json",
    companyId: savedLogin.companyId || "4", // Header companyId
    "X-Auth-Token": savedLogin.token || "", // token
    product: "TOPAZ",
  });

  const [queryCompanyId, setQueryCompanyId] = useState("13"); // Query param companyid

  const [pobList, setPobList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rawResponse, setRawResponse] = useState(null);

  // Save header info automatically
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        companyId: headers.companyId,
        token: headers["X-Auth-Token"],
      })
    );
  }, [headers]);

  const updateHeader = (key, value) => setHeaders((prev) => ({ ...prev, [key]: value }));
  const updateQuery = (value) => setQueryCompanyId(value);

  const fetchPOBList = async () => {
    if (!queryCompanyId) {
      setError("Query Param 'companyid' is required");
      return;
    }

    setLoading(true);
    setError("");
    setPobList([]);
    setRawResponse(null);

    try {
      const res = await axios.get(DEFAULT_PROXY, {
        params: { companyid: queryCompanyId }, // API expects lowercase 'companyid'
        headers,
      });

      setRawResponse(res.data);

      if (res.data.status === "SUCCESS" && Array.isArray(res.data.response)) {
        setPobList(res.data.response);
      } else {
        setError("Failed to fetch assigned POBs");
      }
    } catch (err) {
      setError(err.message || "Request failed");
      setRawResponse(err.response?.data || null);
    } finally {
      setLoading(false);
    }
  };

  const finalURL = `${DEFAULT_PROXY}?companyid=${queryCompanyId}`;

  return (
    <div style={{ padding: 20 }}>
      <h2>Assigned Place of Businesses</h2>

      <div>
        <label>Query Param (companyid): </label>
        <input
          value={queryCompanyId}
          onChange={(e) => updateQuery(e.target.value)}
          style={{ padding: 6, marginLeft: 10 }}
        />
      </div>

      <h3>Headers (Editable)</h3>
      {Object.entries(headers).map(([key, value]) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <label style={{ width: 140, display: "inline-block" }}>{key}:</label>
          <input
            type={key === "X-Auth-Token" ? "password" : "text"}
            value={value}
            onChange={(e) => updateHeader(key, e.target.value)}
            style={{ padding: 6, width: 300 }}
          />
        </div>
      ))}

      <button
        onClick={fetchPOBList}
        disabled={loading}
        style={{ padding: "8px 16px", marginTop: 10 }}
      >
        {loading ? "Loading..." : "Fetch POBs"}
      </button>

      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}

      {pobList.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>POB List ({pobList.length})</h3>
          <ul>
            {pobList.map((pob, index) => (
              <li key={index}>
                {pob.companyName} ({pob.cmpPincode})
              </li>
            ))}
          </ul>
        </div>
      )}

      {rawResponse && (
        <div style={{ marginTop: 20 }}>
          <h3>Raw Response</h3>
          <pre style={{ background: "#eee", padding: 10 }}>{JSON.stringify(rawResponse, null, 2)}</pre>
        </div>
      )}

      <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>Request URL: {finalURL}</div>
    </div>
  );
};

export default AssignedPOB;
