import React, { useState } from "react";
import axios from "axios";

const CEWBGenerateForm = () => {
  // 🔒 STATIC PAYLOAD VALUES
  const [formData, setFormData] = useState({
    fromPlace: "Akodiya",
    fromState: 5,
    vehicleNo: "RJ14CA9999",
    transMode: 1,
    transDocNo: "1212",
    transDocDate: "15/11/2025",
    tripSheetEwbBills: ["351010498047"],
    companyId: null,
    userGstin: "05AAAAU1183B5ZW"
  });

  // ONLY TRIPSHEET CAN CHANGE (IF YOU WANT)
  const handleEwbList = (e) => {
    const arr = e.target.value.split(",").map((v) => v.trim());
    setFormData({ ...formData, tripSheetEwbBills: arr });
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);

  // STATIC HEADERS
  const token = localStorage.getItem("token") || "Not found";
  const companyIdLS = localStorage.getItem("companyId") || "Not found";

  const headersPreview = {
    accept: "application/json",
    companyId: companyIdLS,
    "X-Auth-Token": token,
    product: "TOPAZ",
    "Content-Type": "application/json",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:3001/proxy/topaz/cewb/generate",
        formData,
        { headers: headersPreview }
      );

      setResponse(res.data);
      alert("CEWB generated! No: " + res.data?.response?.cEwbNo);
    } catch (err) {
      setError(err.response?.data?.message || "CEWB generation failed");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "700px", margin: "auto", padding: "20px" }}>
      <h2>Generate Consolidated EWB</h2>

      {/* ---- ONLY EWB INPUT (OPTIONAL EDIT) ---- */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          name="tripSheetEwbBills"
          placeholder="EWB Nos (comma-separated)"
          defaultValue="351010498047"
          onChange={handleEwbList}
        />
        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate CEWB"}
        </button>
      </form>

      {/* ---- STATIC HEADERS ---- */}
      <h3>🟦 Headers (Static)</h3>
      <pre style={{ background: "#f4f4f4", padding: "15px" }}>
        {JSON.stringify(headersPreview, null, 2)}
      </pre>

      {/* ---- STATIC PAYLOAD ---- */}
      <h3>🟧 Payload (Static)</h3>
      <pre style={{ background: "#f4f4f4", padding: "15px" }}>
        {JSON.stringify(formData, null, 2)}
      </pre>

      {/* ---- ERROR ---- */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ---- RESPONSE ---- */}
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

export default CEWBGenerateForm;
