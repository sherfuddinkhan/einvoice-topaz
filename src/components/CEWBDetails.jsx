import React, { useState } from "react";
import axios from "axios";

const CEWBDetails = () => {
  // STATIC QUERY PARAMETERS
  const [params, setParams] = useState({
    userGstin: "05AAAAU1183B5ZW",
    cEwbNo: "3410033800", // Editable from UI
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);

  // STATIC HEADERS
  const token = localStorage.getItem("token") || "Not found";
  const companyId = localStorage.getItem("companyId") || "Not found";

  const headersPreview = {
    accept: "application/json",
    companyId,
    "X-Auth-Token": token,
    product: "TOPAZ",
  };

  const handleChange = (e) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResponse(null);
    setLoading(true);

    try {
      const url = `http://localhost:3001/proxy/topaz/cewb/details?userGstin=${params.userGstin}&cEwbNo=${params.cEwbNo}`;

      const res = await axios.get(url, { headers: headersPreview });

      setResponse(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch CEWB details");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
      <h2>Get Consolidated EWB Details</h2>

      {/* -------------------- FORM -------------------- */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <label>CEWB No:</label>
        <input
          name="cEwbNo"
          value={params.cEwbNo}
          onChange={handleChange}
          placeholder="Enter CEWB Number"
          required
        />
        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Fetching..." : "Get CEWB Details"}
        </button>
      </form>

      {/* -------------------- HEADERS PREVIEW -------------------- */}
      <h3>🟦 Headers Preview</h3>
      <pre style={{ background: "#f4f4f4", padding: "15px" }}>
        {JSON.stringify(headersPreview, null, 2)}
      </pre>

      {/* -------------------- REQUEST PREVIEW -------------------- */}
      <h3>🟧 Request Preview</h3>
      <pre style={{ background: "#f4f4f4", padding: "15px" }}>
        {`GET /proxy/topaz/cewb/details?userGstin=${params.userGstin}&cEwbNo=${params.cEwbNo}`}
      </pre>

      {/* -------------------- ERROR -------------------- */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* -------------------- RESPONSE -------------------- */}
      {response && (
        <>
          <h3>🟩 API Response</h3>
          <pre style={{ background: "#eafbea", padding: "15px" }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
};

export default CEWBDetails;
