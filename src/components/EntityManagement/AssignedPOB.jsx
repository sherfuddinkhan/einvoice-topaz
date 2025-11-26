import React, { useState, useEffect } from "react";
import axios from "axios";

const STORAGE_KEY = "iris_einvoice_shared_config";
const LOGIN_RESPONSE_KEY = "iris_login_data";

const AssignedPOB = () => {
  const savedConfig = JSON.parse(localStorage.getItem(LOGIN_RESPONSE_KEY) || "{}");

  const [config, setConfig] = useState({
    proxyBase: "http://localhost:3001/proxy",
    endpoint: "/mgmt/pob/list", // ✔ correct proxy path

    headers: {
      Accept: "application/json",
      companyId: savedConfig?.companyId || savedConfig?.companyId || "",
      "X-Auth-Token":
        savedConfig?.token || savedConfig?.token || "",
      product: "TOPAZ",
    },

    queryCompanyId:
     savedConfig?.companyId || savedConfig?.companyId || "",
  });

  const [pobList, setPobList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rawResponse, setRawResponse] = useState(null);

  // Save companyId & token automatically
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        companyId: config.headers.companyId,
        token: config.headers["X-Auth-Token"],
      })
    );
  }, [config.headers]);

  const updateHeader = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      headers: { ...prev.headers, [key]: value },
    }));
  };

  const updateQuery = (value) => {
    setConfig((prev) => ({ ...prev, queryCompanyId: value }));
  };

  const fetchPOBList = async () => {
    if (!config.queryCompanyId) {
      setError("Company ID is required");
      return;
    }

    setLoading(true);
    setError("");
    setPobList([]);
    setRawResponse(null);

    const finalURL = `${config.proxyBase}${config.endpoint}?companyId=${config.queryCompanyId}`;

    try {
      const res = await axios.get(finalURL, {
        headers: config.headers,
      });

      setRawResponse(res.data);

      if (res.data.status === "SUCCESS" && Array.isArray(res.data.response)) {
        setPobList(res.data.response);
      } else {
        setError("Failed to fetch assigned places of business");
      }
    } catch (err) {
      setError(err.message || "Request failed");
      setRawResponse(err.response?.data || null);
    } finally {
      setLoading(false);
    }
  };

  const finalURL = `${config.proxyBase}${config.endpoint}?companyId=${config.queryCompanyId}`;

  return (
    <div style={{ padding: 20 }}>
      <h2>Assigned Place of Businesses</h2>

      <div>
        <label>Query Param (companyId):</label>
        <input
          value={config.queryCompanyId}
          onChange={(e) => updateQuery(e.target.value)}
          style={{ padding: 6, marginLeft: 10 }}
        />
      </div>

      <h3>Headers (Editable)</h3>
      {Object.entries(config.headers).map(([key, value]) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <label style={{ width: 140, display: "inline-block" }}>
            {key}:
          </label>
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
          <pre style={{ background: "#eee", padding: 10 }}>
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
        Request URL: {finalURL}
      </div>
    </div>
  );
};

export default AssignedPOB;
