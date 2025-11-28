import React, { useState, useEffect } from "react";
import axios from "axios";

// ─────────────────────────────────────────────
// LocalStorage Keys
// ─────────────────────────────────────────────
const LOGIN_KEY = "iris_login_data";
const LATEST_EWB_KEY = "latestEwbData";
const HEADER_KEY = "BULK_HEADER";
const DOC_LIST_KEY = "BULK_DOC_LIST";
const QUERY_KEY = "BULK_QUERY";

const BulkStatus = () => {
  // ========== HEADERS (ONLY HEADER COMPANYID ALLOWED) ==========
  const [headers, setHeaders] = useState({
    companyId: "",
    authToken: "",
    product: "TOPAZ",
  });

  // ========== QUERY PARAMS ==========
  const [query, setQuery] = useState({
    userGstin: "",
    docNumList: [],
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────────
  // 🔥 AUTOPOPULATE GSTIN + DOC NUMBER LIST
  // ─────────────────────────────────────────────
  useEffect(() => {
    const login = JSON.parse(localStorage.getItem(LOGIN_KEY) || "{}");
    const savedHeader = JSON.parse(localStorage.getItem(HEADER_KEY) || "{}");
    const savedQuery = JSON.parse(localStorage.getItem(QUERY_KEY) || "{}");
    const savedDocs = JSON.parse(localStorage.getItem(DOC_LIST_KEY) || "[]");
    const latest = JSON.parse(localStorage.getItem(LATEST_EWB_KEY) || "{}");

    // ---------------------------
    // AUTOFILL HEADERS
    // ---------------------------
    setHeaders({
      companyId: savedHeader.companyId || login.companyId || "",
      authToken: savedHeader.authToken || login.token || "",
      product: savedHeader.product || "TOPAZ",
    });

    // ---------------------------
    // AUTOFILL GSTIN LOGIC
    // Priority:
    // 1. latestEwb.fullApiResponse.response.fromGstin
    // 2. savedQuery.userGstin
    // 3. login.gstin
    // ---------------------------
    let autoGstin =
      latest?.fullApiResponse?.response?.fromGstin ||
      latest?.fromGstin ||
      savedQuery?.userGstin ||
      login?.gstin ||
      "";

    // ---------------------------
    // AUTOFILL DOC NUMBER LIST
    // Priority:
    // 1. latestEwb.fullApiResponse.response.docNumList
    // 2. savedDocs
    // 3. savedQuery.docNumList
    // ---------------------------
    let autoDocList = [];

    if (Array.isArray(latest?.docNumList)) {
      autoDocList = latest.docNumList; // direct array
    } else if (latest?.fullApiResponse?.response?.transDocNo) {
      autoDocList = [latest.fullApiResponse.response.transDocNo];
    } else if (savedDocs.length > 0) {
      autoDocList = savedDocs;
    } else if (savedQuery?.docNumList?.length > 0) {
      autoDocList = savedQuery.docNumList;
    }

    // Final Set
    setQuery({
      userGstin: autoGstin,
      docNumList: autoDocList,
    });
  }, []);

  // ─────────────────────────────────────────────
  // INPUT HANDLERS
  // ─────────────────────────────────────────────

  const handleHeaderChange = (name, value) => {
    const updated = { ...headers, [name]: value };
    setHeaders(updated);
    localStorage.setItem(HEADER_KEY, JSON.stringify(updated));
  };

  const handleQueryChange = (name, value) => {
    const updated = { ...query, [name]: value };
    setQuery(updated);
    localStorage.setItem(QUERY_KEY, JSON.stringify(updated));
  };

  const handleDocListChange = (value) => {
    const list = value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v !== "");
    setQuery({ ...query, docNumList: list });
    localStorage.setItem(DOC_LIST_KEY, JSON.stringify(list));
  };

  // ─────────────────────────────────────────────
  // API CALL
  // ─────────────────────────────────────────────
  const fetchStatus = async () => {
    try {
      setLoading(true);
      setResponse(null);

      const res = await axios.get(
        "http://localhost:3001/proxy/topaz/ewb/bulkStatus",
        {
          params: {
            userGstin: query.userGstin,
            docNumList: query.docNumList,
          },
          headers: {
            Accept: "application/json",
            product: headers.product,
            companyId: headers.companyId, // ONLY IN HEADER
            "X-Auth-Token": headers.authToken,
          },
        }
      );

      setResponse(res.data);
    } catch (err) {
      setResponse(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <div style={{ padding: 20, width: 800 }}>
      <h2>EWB Bulk Status Checker</h2>

      {/* HEADERS */}
      <div style={{ background: "#fafafa", padding: 15, borderRadius: 8 }}>
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

      {/* QUERY PARAMS */}
      <div style={{ background: "#e9f4ff", padding: 15, marginTop: 20, borderRadius: 8 }}>
        <h3>Query Params</h3>

        <label>User GSTIN</label>
        <input
          value={query.userGstin}
          onChange={(e) => handleQueryChange("userGstin", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <label>Document Numbers (comma-separated)</label>
        <input
          value={query.docNumList.join(", ")}
          onChange={(e) => handleDocListChange(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      {/* SUBMIT */}
      <button
        onClick={fetchStatus}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          fontSize: 16,
        }}
      >
        {loading ? "Checking..." : "Check Bulk Status"}
      </button>

      {/* RESPONSE */}
      {response && (
        <pre style={{ marginTop: 20, background: "#eee", padding: 10, borderRadius: 6 }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}

      {/* FINAL PAYLOAD SHOWN */}
      <h3>Final Payload Sent</h3>
      <pre style={{ background: "#fff4d1", padding: 10, borderRadius: 6 }}>
        {JSON.stringify({ headers, queryParams: query }, null, 2)}
      </pre>
    </div>
  );
};

export default BulkStatus;
