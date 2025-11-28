import React, { useState, useEffect } from "react";
import axios from "axios";

const STORAGE_KEY = "iris_einvoice_shared_config";
const LOGIN_RESPONSE_KEY = "iris_login_data";
const DEFAULT_PROXY = "http://localhost:3001/proxy/mgmt/businessHierarchy";

const BusinessHierarchy = () => {
  const savedLogin = JSON.parse(localStorage.getItem(LOGIN_RESPONSE_KEY) || "{}");
  const savedConfig = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  const [headers, setHeaders] = useState({
    Accept: "application/json",
    companyId: savedLogin.companyId || savedConfig.companyId || "4",
    "X-Auth-Token": savedLogin.token || savedConfig.token || "",
    product: "TOPAZ",
  });

  const [queryCompanyId, setQueryCompanyId] = useState(savedLogin.companyId || savedConfig.companyId || "13");

  const [businessData, setBusinessData] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-save headers to localStorage
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

  const fetchBusinessHierarchy = async () => {
    if (!queryCompanyId) {
      setError("Query Param 'companyid' is required");
      return;
    }

    setLoading(true);
    setError("");
    setBusinessData(null);
    setRawResponse(null);

    try {
      const res = await axios.get(DEFAULT_PROXY, {
        params: { companyid: queryCompanyId },
        headers,
      });

      setRawResponse(res.data);

      if (res.data.status === "SUCCESS") {
        setBusinessData(res.data.response);
      } else {
        setError(res.data.message || "Failed to fetch business hierarchy");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Request failed");
      setRawResponse(err.response?.data || null);
    } finally {
      setLoading(false);
    }
  };

  const renderCompanyNode = (company) => (
    <li key={company.companyId} style={{ margin: "10px 0" }}>
      <div style={{ fontWeight: "bold" }}>
        {company.companyName} ({company.entityType})
      </div>
      <div>Company ID: {company.companyId}</div>
      {company.gstin && <div>GSTIN: {company.gstin}</div>}
      {company.pobCode && <div>POB Code: {company.pobCode}</div>}
      {company.childCompanies && company.childCompanies.length > 0 && (
        <ul style={{ marginLeft: 20 }}>
          {company.childCompanies.map((child) => renderCompanyNode(child))}
        </ul>
      )}
    </li>
  );

  const finalURL = `${DEFAULT_PROXY}?companyid=${queryCompanyId}`;

  return (
    <div style={{ padding: 30, fontFamily: "Arial", background: "#f4f4f4" }}>
      <div style={{ background: "white", padding: 20, borderRadius: 10 }}>
        <h2>Business Hierarchy</h2>

        <div>
          <label>Query Param (companyid): </label>
          <input
            value={queryCompanyId}
            onChange={(e) => updateQuery(e.target.value)}
            style={{ padding: 8, marginLeft: 10, width: 200 }}
          />
        </div>

        <h3>Headers</h3>
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} style={{ marginBottom: 10 }}>
            <label style={{ width: 140, display: "inline-block", fontWeight: "bold" }}>
              {key}:
            </label>
            <input
              type={key === "X-Auth-Token" ? "password" : "text"}
              value={value}
              onChange={(e) => updateHeader(key, e.target.value)}
              style={{ width: 300, padding: 8 }}
            />
          </div>
        ))}

        <button
          onClick={fetchBusinessHierarchy}
          disabled={loading}
          style={{
            padding: "10px 20px",
            background: "#2196f3",
            color: "white",
            border: "none",
            borderRadius: 8,
            marginTop: 10,
          }}
        >
          {loading ? "Loading..." : "Fetch Business Hierarchy"}
        </button>

        <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>Request URL: {finalURL}</div>
      </div>

      {error && (
        <div style={{ background: "#ffcdd2", padding: 12, marginTop: 20, color: "#b71c1c" }}>
          {error}
        </div>
      )}

      {rawResponse && (
        <div style={{ background: "#fff8e1", padding: 20, marginTop: 20, borderRadius: 10 }}>
          <h3>Raw Response</h3>
          <pre style={{ background: "#222", color: "#0f0", padding: 15, borderRadius: 6, maxHeight: 400, overflow: "auto" }}>
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>
      )}

      {businessData && (
        <div style={{ background: "white", padding: 20, marginTop: 20, borderRadius: 10 }}>
          <h3>Business Hierarchy Tree</h3>
          <ul>{renderCompanyNode(businessData)}</ul>
        </div>
      )}
    </div>
  );
};

export default BusinessHierarchy;
