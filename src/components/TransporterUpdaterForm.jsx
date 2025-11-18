import React, { useState } from "react";
import axios from "axios";

const TransporterUpdaterForm = ({ shared }) => {
  const [payload, setPayload] = useState({
    ewbNo: "",
    transporterId: "",
    userGstin: shared?.userGstin || "",
    transporterName: "",
    companyId: shared?.companyId || null,
  });

  const [headers, setHeaders] = useState({
    "X-Auth-Token": shared.token || "",
    companyId: shared.companyId || "",
    product: "TOPAZ",
    "Content-Type": "application/json",
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdate = async () => {
    if (!payload.ewbNo || !payload.transporterId)
      return alert("Please provide EWB Number and Transporter ID");

    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await axios.post("/proxy/topaz/ewb/transporter", payload, {
        headers: headers,
      });
      setResponse(res.data);
    } catch (err) {
      setError(err.response?.data || { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", fontFamily: "Arial" }}>
      <h2>Update Transporter ID</h2>

      {/* Headers */}
      <div style={{ marginBottom: "10px" }}>
        <h3>Headers (Editable)</h3>
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} style={{ marginBottom: "5px" }}>
            <input
              value={key}
              readOnly
              style={{ width: "120px", marginRight: "5px" }}
            />
            <input
              value={value}
              onChange={(e) =>
                setHeaders({ ...headers, [key]: e.target.value })
              }
              style={{ width: "400px" }}
            />
          </div>
        ))}
      </div>

      {/* Payload */}
      <div style={{ marginBottom: "10px" }}>
        <h3>Payload (Editable)</h3>
        <textarea
          rows={8}
          style={{ width: "100%" }}
          value={JSON.stringify(payload, null, 2)}
          onChange={(e) => {
            try {
              setPayload(JSON.parse(e.target.value));
            } catch {}
          }}
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleUpdate}
        style={{ padding: "8px 12px", marginBottom: "20px" }}
      >
        Update Transporter
      </button>

      {/* Response */}
      <div>
        <h3>Response</h3>
        {loading && <p>Loading...</p>}
        {error && (
          <pre style={{ color: "red", background: "#f5f5f5", padding: "10px" }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        )}
        {response && (
          <pre style={{ background: "#f5f5f5", padding: "10px", maxHeight: "500px", overflowY: "auto" }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default TransporterUpdaterForm;
