import React, { useState, useEffect } from "react";
import axios from "axios";

const LOGIN_RESPONSE_KEY = "iris_login_data";
const HEADER_KEY = "EWB_HEADER_DATA";
const STATUS_STORE_KEY = "BULK_STATUS_PARAMS";

const BulkStatus = () => {
  const [headers, setHeaders] = useState({
    companyId: "",
    authToken: "",
    product: "TOPAZ",
  });

  const [query, setQuery] = useState({
    companyId: "",
    userGstin: "",
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------
  // 🔥 AUTOFILL from login + previous saved data
  // ---------------------------------------------
  useEffect(() => {
    const login = JSON.parse(localStorage.getItem(LOGIN_RESPONSE_KEY) || "{}");
    const savedHeader = JSON.parse(localStorage.getItem(HEADER_KEY) || "{}");
    const savedQuery = JSON.parse(localStorage.getItem(STATUS_STORE_KEY) || "{}");

    setHeaders({
      companyId: savedHeader.companyId || login.companyId || "",
      authToken: savedHeader.authToken || login.token || "",
      product: savedHeader.product || "TOPAZ",
    });

    setQuery({
      companyId: savedQuery.companyId || login.companyId || "",
      userGstin: savedQuery.userGstin || login.gstin || "",
    });
  }, []);

  // Save header fields
  const handleHeaderChange = (field, value) => {
    const updated = { ...headers, [field]: value };
    setHeaders(updated);
    localStorage.setItem(HEADER_KEY, JSON.stringify(updated));
  };

  // Save query fields
  const handleQueryChange = (field, value) => {
    const updated = { ...query, [field]: value };
    setQuery(updated);
    localStorage.setItem(STATUS_STORE_KEY, JSON.stringify(updated));
  };

  // ----------------------------------------------------
  // 🔥 Fetch Bulk Status
  // GET /proxy/topaz/ewb/bulkStatus?companyId=&userGstin=
  // ----------------------------------------------------
  const checkStatus = async () => {
    try {
      setLoading(true);
      setResponse(null);

      const res = await axios.get("http://localhost:3001/proxy/topaz/ewb/bulkStatus", {
        params: {
          companyId: query.companyId,
          userGstin: query.userGstin,
        },
        headers: {
          Accept: "application/json",
          product: headers.product,
          companyId: headers.companyId,
          "X-Auth-Token": headers.authToken,
        },
      });

      setResponse(res.data);
    } catch (err) {
      setResponse(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, width: "700px" }}>
      <h2>EWB Bulk Status Checker</h2>

      {/* HEADER SECTION */}
      <div style={{ background: "#f7f7f7", padding: 15, borderRadius: 8 }}>
        <h3>Headers</h3>

        <label>Company ID</label>
        <input
          value={headers.companyId}
          onChange={(e) => handleHeaderChange("companyId", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <label>X-Auth-Token</label>
        <input
          value={headers.authToken}
          onChange={(e) => handleHeaderChange("authToken", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <label>Product</label>
        <input
          value={headers.product}
          onChange={(e) => handleHeaderChange("product", e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      {/* QUERY PARAM SECTION */}
      <div style={{ background: "#e8f4ff", padding: 15, marginTop: 20, borderRadius: 8 }}>
        <h3>Status Check Query Params</h3>

        <label>Company ID</label>
        <input
          value={query.companyId}
          onChange={(e) => handleQueryChange("companyId", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <label>User GSTIN</label>
        <input
          value={query.userGstin}
          onChange={(e) => handleQueryChange("userGstin", e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      <button
        onClick={checkStatus}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          fontSize: 16,
        }}
      >
        {loading ? "Checking..." : "Check Status"}
      </button>

      {/* SHOW RESPONSE */}
      {response && (
        <pre
          style={{
            marginTop: 20,
            background: "#eee",
            padding: 10,
            borderRadius: 6,
            maxHeight: "300px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default BulkStatus;
