import React, { useState, useEffect } from "react";
import axios from "axios";

// LocalStorage keys
const LOGIN_RESPONSE_KEY = "iris_login_data";
const LATEST_EWB_KEY = "latestEwbData";

// Helper to read JSON safely
const getLocalStorageData = (key) => {
  try {
    const raw = localStorage.getItem(key);
    console.log(`📥 Loaded ${key}:`, raw);
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
};

const CEWBDetails = () => {
  const [authData, setAuthData] = useState({ token: "", companyId: "", userGstin: "" });
  const [headers, setHeaders] = useState({
    "X-Auth-Token": "",
    companyId: "",
    product: "TOPAZ",
    "Content-Type": "application/json",
    accept: "application/json",
  });
  const [payload, setPayload] = useState({});
  const [payloadText, setPayloadText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);

  // --------------------------
  // AUTO POPULATE on mount
  // --------------------------
  useEffect(() => {
    const login = getLocalStorageData(LOGIN_RESPONSE_KEY);
    const savedEwbData = getLocalStorageData(LATEST_EWB_KEY);

    console.log("🔎 login:", login);
    console.log("🔎 savedEwbData:", savedEwbData);

    // --------------------------
    // Extract
    // --------------------------
    const gstin = savedEwbData?.response?.fromGstin || login.userGstin || "";
    const companyId = login.companyId || 7;
    const token = login.token || "";

    console.log("➡ GSTIN:", gstin);
    console.log("➡ CompanyId:", companyId);
    console.log("➡ Token:", token);

    setAuthData({ token, companyId, userGstin: gstin });

    // --------------------------
    // Set Headers
    // --------------------------
    const headerObj = {
      "X-Auth-Token": token,
      companyId,
      product: "TOPAZ",
      "Content-Type": "application/json",
      accept: "application/json",
    };
    setHeaders(headerObj);
    console.log("📌 Headers:", headerObj);

    // --------------------------
    let previousEwbs     = "";  // → tripSheetEwbBills
    let previousGstin    = " ";  // → userGstin (sender's GSTIN)
    let fromPlace        = "";
    let fromStateCode    = "";
    let transMode        = "";
    let transDocDate     = "";
    let transDocNo       = "";
    let vehicleNo        = "";

   let tripSheetEwbBills = [];

    if (Array.isArray(savedEwbData.allEwbs)) {
      previousEwbs = savedEwbData.allEwbs.map((x) => x.ewbNo).filter(Boolean);
    } else if (savedEwbData?.response?.ewbNo) {
      previousEwbs = [savedEwbData.response.ewbNo];
    } else if (savedEwbData?.ewbNo) {
     previousEwbs = [savedEwbData.ewbNo];
    }

  // fallback
if (previousEwbs.length === 0) previousEwbs = ["351010498047"];


    
  // ───── Extract fromGstin → userGstin (as array) ─────
if (savedEwbData?.fullApiResponse?.response?.fromGstin) {
  previousGstin = savedEwbData.fullApiResponse.response.fromGstin;
}
else if (savedEwbData?.fromGstin) {
  previousGstin = savedEwbData.fromGstin;
}

// Fallback GSTIN if still empty
if (previousGstin.length === 0) {
  previousGstin = "05AAAAU1183B5ZW"; // or your default like "351010498047" if preferred
}

  // ───── Extract place → fromplace (as array) ─────
if (savedEwbData?.fullApiResponse?.response?.fromPlace) {
  fromPlace= savedEwbData.fullApiResponse.response.fromPlace;
}
else if (savedEwbData?.fromPlace) {
  fromPlace= savedEwbData.fromPlace;
}

// Fallback GSTIN if still empty
if (fromPlace.length === 0) {
  fromPlace= "Akhondiya"; // or your default like "351010498047" if preferred
}
///////////////////////////////////////////////////
 // ───── Extract state → fromstate (as array) ─────
if (savedEwbData?.fullApiResponse?.response?.fromStateCode) {
  fromStateCode= savedEwbData.fullApiResponse.response.fromStateCode;
}
else if (savedEwbData?.fromStateCode) {
  fromStateCode= savedEwbData.fromStateCode;
}

// Fallback GSTIN if still empty
if (fromPlace.length === 0) {
  fromStateCode= "5"; // or your default like "351010498047" if preferred
}
/////////////////////////////////
 // ───── Extract transDocNo→ transDocNo ─────
if (savedEwbData?.fullApiResponse?.response?.transDocNo) {
 transDocNo= savedEwbData.fullApiResponse.response.transDocNo;
}
else if (savedEwbData?.transDocNo) {
  transDocNo = savedEwbData.transDocNo;
}

// Fallback GSTIN if still empty
if (transDocNo.length === 0) {
   transDocNo= "1234"; // or your default like "351010498047" if preferred
}
/////////////////////////////////
if (savedEwbData?.fullApiResponse?.response?.transDocDate) {
 transDocDate= savedEwbData.fullApiResponse.response.transDocDate;
}
else if (savedEwbData?.transDocDate) {
  transDocDate= savedEwbData.transDocDate;
}

// Fallback GSTIN if still empty
if (transDocDate.length === 0) {
  transDocDate= "12/11/2025"; // or your default like "351010498047" if preferred
}
//////////////////
if (savedEwbData?.payloadUsed?.vehicleNo) 
  {
  vehicleNo= savedEwbData.payloadUsed.vehicleNo;
}
else if (savedEwbData?.vehicleNo) {
  vehicleNo=savedEwbData.vehicleNo;
}

// Fallback GSTIN if still empty
if (vehicleNo.length === 0) {
  vehicleNo = "10092"; // or your default like "351010498047" if preferred
}
////////////////////////
if (savedEwbData?.fullApiResponse?.response?.transMode) {
  transMode= savedEwbData.fullApiResponse.response.transMode;
}
else if (savedEwbData?.transMode) {
  transMode= savedEwbData.transMode;
}
// Fallback GSTIN if still empty
if (transMode.transMode === 0) {
  transMode= "3"; // or your default like "351010498047" if preferred
}

    console.log("📌 tripSheetEwbBills:", previousEwbs);
    console.log("📌 userGstin:", previousGstin);
    console.log("📌 fromPlace:", fromPlace);
    console.log("📌 fromStateCode", fromStateCode);
    console.log("📌 transMode", transMode);
    console.log("📌 transDocDate ", transDocDate );
    console.log("📌 transDocNo", transDocNo);
    console.log("📌vehicleNo", vehicleNo);
    // --------------------------
    // Build Payload (using response.* fields)
    // --------------------------
    const r = savedEwbData.response || {};

    const initialPayload = {
      fromPlace: fromPlace,
      fromState: fromStateCode || 7,
      vehicleNo: vehicleNo || "RJ14CA9999",
      transMode: transMode,
      transDocNo: transDocNo || "1212",
      transDocDate: transDocDate || "15/11/2025",
      tripSheetEwbBills: previousEwbs,
      companyId,
      userGstin: previousGstin,
    };

    console.log("📦 Payload:", initialPayload);

    setPayload(initialPayload);
    setPayloadText(JSON.stringify(initialPayload, null, 2));
  }, []);

  // --------------------------
  // JSON Payload Edit
  // --------------------------
  const handlePayloadChange = (text) => {
    setPayloadText(text);
    try {
      const parsed = JSON.parse(text);
      setPayload(parsed);
      setError("");
    } catch {
      setError("Invalid JSON");
    }
  };

  // --------------------------
  // Header edit
  // --------------------------
  const handleHeaderChange = (key, value) => {
    const updated = { ...headers, [key]: value };
    console.log("✏ Updated Header:", updated);
    setHeaders(updated);
  };

  // --------------------------
  // SUBMIT CEWB
  // --------------------------
  const handleSubmit = async () => {
  setLoading(true);
  setError("");
  setResponse(null);

  try {
    // 1️⃣ Call CEWB API
    const res = await axios.post(
      "http://localhost:3001/proxy/topaz/cewb/generate",
      payload,
      { headers }
    );

    console.log("🎉 CEWB Response:", res.data);
    setResponse(res.data);

    // 2️⃣ Save updated CEWB locally
    const saved = getLocalStorageData(LATEST_EWB_KEY);
    const allEwbs = [...(saved.allEwbs || [])];

    if (res.data.response?.cEwbNo) {
      allEwbs.push({ ewbNo: res.data.response.cEwbNo });
    }

    const updated = {
      ...saved,
      cewbResponse: res.data.response,
      allEwbs,
    };

    console.log("💾 Saving CEWB:", updated);
    localStorage.setItem(LATEST_EWB_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("❌ API Error:", err);
    setError(err?.response?.data?.message || err.message || "API Error");
    setResponse(err?.response?.data || null);
  } finally {
    setLoading(false);
  }
};


  // --------------------------
  // UI
  // --------------------------
  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "20px", fontFamily: "Arial" }}>
      <h2>Generate Consolidated E-Way Bill (CEWB)</h2>

      {/* Headers */}
      <div style={{ marginBottom: 20 }}>
        <h3>Headers</h3>
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} style={{ marginBottom: 6 }}>
            <strong>{key}:</strong>
            <input
              style={{ width: "80%", marginLeft: 10 }}
              value={value}
              onChange={(e) => handleHeaderChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Payload Editor */}
      <div style={{ marginBottom: 20 }}>
        <h3>Payload JSON</h3>
        <textarea
          rows={14}
          value={payloadText}
          style={{ width: "100%", fontFamily: "monospace" }}
          onChange={(e) => handlePayloadChange(e.target.value)}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      <button onClick={handleSubmit} disabled={loading} style={{ padding: "10px 20px" }}>
        {loading ? "Generating..." : "Generate CEWB"}
      </button>

      {/* API Response */}
      {response && (
        <div style={{ marginTop: 20 }}>
          <h3>API Response</h3>
          <pre style={{ background: "#f5f5f5", padding: 10 }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {/* Final Preview */}
      <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 10, borderRadius: 4 }}>
        <h3>Final Payload</h3>
        <pre style={{ background: "#f5f5f5", padding: 10 }}>
          {JSON.stringify(payload, null, 2)}
        </pre>
        <h3>Headers</h3>
        <pre style={{ background: "#f5f5f5", padding: 10 }}>
          {JSON.stringify(headers, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default CEWBDetails;
