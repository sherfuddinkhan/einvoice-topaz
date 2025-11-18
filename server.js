// -------------------------------------
// IMPORTS & APP SETUP
// -------------------------------------
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3002"],
    credentials: true,
  })
);
app.use(bodyParser.json());

// Log all incoming requests for debug
app.use((req, res, next) => {
  console.log(`[Backend] ${req.method} ${req.path} - Headers: ${JSON.stringify(req.headers)}`);
  next();
});

// -------------------------------------
// BASE URL
// -------------------------------------
const BASE_URL = "https://stage-api.irisgst.com";

// -------------------------------------
// AUTH HEADER BUILDER
// -------------------------------------
const authHeaders = (req) => ({
  "X-Auth-Token": req.headers["x-auth-token"] || req.headers["authorization"]?.replace('Bearer ', '') || "",
  companyId: req.headers["companyid"] || req.headers["companyId"] || "",
  product: req.headers["product"] || "",
});

// -------------------------------------
// UNIVERSAL PROXY HANDLER
// -------------------------------------
async function proxyRequest(res, requestFn) {
  try {
    const response = await requestFn();
    res.json(response.data);
  } catch (error) {
    console.error(`[Proxy Error] ${error.message} - Response:`, error.response?.data);  // Log full error
    res
      .status(error?.response?.status || 500)
      .json(error?.response?.data || { error: "Proxy Server Error" });
  }
}

/* ======================================================================
   1. AUTH MODULE (Public - No Auth)
   ====================================================================== */
// LOGIN
app.post("/proxy/login", (req, res) =>
  proxyRequest(res, () =>
    axios.post(`${BASE_URL}/irisgst/mgmt/login`, req.body, {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    })
  )
);

// CHANGE PASSWORD
app.post("/proxy/change-password", (req, res) =>
  proxyRequest(res, () =>
    axios.post(
      `${BASE_URL}/irisgst/mgmt/public/user/changepassword`,
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    )
  )
);

/* ======================================================================
   2. TOPAZ - EWAY BILL APIs (Require Auth)
   ====================================================================== */
// Generate EWB
app.post("/proxy/topaz/ewb/generate", (req, res) =>
  proxyRequest(res, () =>
    axios.post(`${BASE_URL}/irisgst/topaz/api/v0.3/ewb`, req.body, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        product: "TOPAZ",
        ...authHeaders(req),
      },
    })
  )
);

// Get EWB Full Details
app.get("/proxy/topaz/ewb/details", (req, res) =>
  proxyRequest(res, () =>
    axios.get(`${BASE_URL}/irisgst/topaz/api/v0.3/getewb/ewbDetails`, {
      params: req.query,
      headers: { Accept: "application/json", product: "TOPAZ", ...authHeaders(req) },
    })
  )
);

// Get EWB by Number
app.get("/proxy/topaz/ewb/byNumber", (req, res) =>
  proxyRequest(res, () =>
    axios.get(`${BASE_URL}/irisgst/topaz/api/v0.3/getewb/ewbNo`, {
      params: req.query,
      headers: { Accept: "application/json", product: "TOPAZ", ...authHeaders(req) },
    })
  )
);


// Update / Cancel / Extend / Reject EWB
app.put("/proxy/topaz/ewb/action", (req, res) =>
  proxyRequest(res, () =>
    axios.put(`${BASE_URL}/irisgst/topaz/api/v0.3/ewb`, req.body, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        product: "TOPAZ",
        ...authHeaders(req),
      },
    })
  )
);

// Update Transporter ID
app.post("/proxy/topaz/ewb/updateTransporter", (req, res) =>
  proxyRequest(res, () =>
    axios.post(`${BASE_URL}/irisgst/topaz/api/v0.3/transporter`, req.body, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        product: "TOPAZ",
        ...authHeaders(req),
      },
    })
  )
);



// Get Generated EWB by Date
app.get("/proxy/topaz/ewb/fetchByDate", (req, res) =>
  proxyRequest(res, () =>
    axios.get(`${BASE_URL}/irisgst/topaz/api/v0.3/getewb/generatorEwbs`, {
      params: req.query,
      headers: { Accept: "application/json", product: "TOPAZ", ...authHeaders(req) },
    })
  )
);

// Generate Consolidated EWB
app.post("/proxy/topaz/cewb/generate", (req, res) =>
  proxyRequest(res, () =>
    axios.post(`${BASE_URL}/irisgst/topaz/api/v0.3/cewb`, req.body, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        product: "TOPAZ",
        ...authHeaders(req),
      },
    })
  )
);

// CEWB Details
app.get("/proxy/topaz/cewb/details", (req, res) =>
  proxyRequest(res, () =>
    axios.get(`${BASE_URL}/irisgst/topaz/api/v0.3/cewb/getcewb`, {
      params: req.query,
      headers: { Accept: "application/json", product: "TOPAZ", ...authHeaders(req) },
    })
  )
);

// EWB by Doc Num + Type
app.get("/proxy/topaz/ewb/byDocNumType", (req, res) =>
  proxyRequest(res, () =>
    axios.get(`${BASE_URL}/irisgst/topaz/api/v0.3/getewb/docNumAndType`, {
      params: req.query,
      headers: { Accept: "application/json", product: "TOPAZ", ...authHeaders(req) },
    })
  )
);

// Bulk EWB Fetch Initiate
app.post("/proxy/topaz/ewb/bulkByDocNum", (req, res) =>
  proxyRequest(res, () =>
    axios.post(`${BASE_URL}/irisgst/topaz/api/v0.3/getewb/docNum`, req.body, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        product: "TOPAZ",
        ...authHeaders(req),
      },
    })
  )
);

// Bulk Status
app.get("/proxy/topaz/ewb/bulkStatus", (req, res) =>
  proxyRequest(res, () =>
    axios.get(`${BASE_URL}/irisgst/topaz/api/v0.3/getewb/docNum/status`, {
      params: req.query,
      headers: { Accept: "application/json", product: "TOPAZ", ...authHeaders(req) },
    })
  )
);

// Bulk Download
app.get("/proxy/topaz/ewb/bulkDownload", (req, res) =>
  proxyRequest(res, () =>
    axios.get(`${BASE_URL}/irisgst/topaz/api/v0.3/getewb/docNum/download`, {
      params: req.query,
      headers: { Accept: "application/json", product: "TOPAZ", ...authHeaders(req) },
    })
  )
);

// ---------------------- MULTI-VEHICLE PROXY ----------------------

// Initiate
app.post("/proxy/topaz/multiVehicle/initiate", (req, res) =>
  axios.post(`${BASE_URL}/irisgst/topaz/api/v0.3/ewb/multiVehicle`, req.body, {
    headers: { "Content-Type": "application/json", Accept: "application/json", product: "TOPAZ", ...authHeaders(req) },
  }).then(r => res.json(r.data))
    .catch(err => res.status(err.response?.status || 500).send(err.response?.data || err.message))
);

// List Requests
app.get("/proxy/topaz/multiVehicle/requests", (req, res) =>
  axios.get(`${BASE_URL}/irisgst/topaz/api/v0.3/getewb/multiVehReq`, {
    params: req.query,
    headers: { Accept: "application/json", product: "TOPAZ", ...authHeaders(req) },
  }).then(r => res.json(r.data))
    .catch(err => res.status(err.response?.status || 500).send(err.response?.data || err.message))
);

// Group Details
app.get("/proxy/topaz/multiVehicle/groupDetails", (req, res) =>
  axios.get(`${BASE_URL}/irisgst/topaz/api/v0.3/getewb/multiVehDet`, {
    params: req.query,
    headers: { Accept: "application/json", product: "TOPAZ", ...authHeaders(req) },
  }).then(r => res.json(r.data))
    .catch(err => res.status(err.response?.status || 500).send(err.response?.data || err.message))
);

// Add Vehicle (Part-B)
app.post("/proxy/topaz/multiVehicle/add", (req, res) =>
  axios.post(`${BASE_URL}/irisgst/topaz/api/v0.3/ewb/multiVehicle/add`, req.body, {
    headers: { "Content-Type": "application/json", Accept: "application/json", product: "TOPAZ", ...authHeaders(req) },
  }).then(r => res.json(r.data))
    .catch(err => res.status(err.response?.status || 500).send(err.response?.data || err.message))
);

// Edit Vehicle
app.post("/proxy/topaz/multiVehicle/edit", (req, res) =>
  axios.post(`${BASE_URL}/irisgst/topaz/api/v0.3/ewb/multiVehicle/edit`, req.body, {
    headers: { "Content-Type": "application/json", Accept: "application/json", product: "TOPAZ", ...authHeaders(req) },
  }).then(r => res.json(r.data))
    .catch(err => res.status(err.response?.status || 500).send(err.response?.data || err.message))
);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


// EWB Print Details (PDF - Binary)
app.post("/proxy/topaz/ewb/printDetails", async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];
    const companyId = req.headers["companyid"] || req.headers["companyId"];
    const response = await axios.post(`${BASE_URL}/irisgst/topaz/ewb/print/details`, req.body, {
      headers: {
        Accept: "application/pdf",
        "Content-Type": "application/json",
        product: "TOPAZ",
        "X-Auth-Token": token,
        companyId,
      },
      responseType: "arraybuffer",
    });
    res.set("Content-Type", "application/pdf");
    res.set("Content-Disposition", "attachment; filename=ewb-details.pdf");
    res.send(response.data);
  } catch (error) {
    console.error('[Print Error]', error.response?.data || error.message);
    res
      .status(error?.response?.status || 500)
      .json(error?.response?.data || { error: "Print failed" });
  }
});

// EWB Print Summary (PDF - Binary)
app.post("/proxy/topaz/ewb/printSummary", async (req, res) => {
  try {
    const token = req.headers["x-auth-token"];
    const companyId = req.headers["companyid"] || req.headers["companyId"];
    const response = await axios.post(`${BASE_URL}/irisgst/topaz/ewb/print/summary`, req.body, {
      headers: {
        Accept: "application/pdf",
        "Content-Type": "application/json",
        product: "TOPAZ",
        "X-Auth-Token": token,
        companyId,
      },
      responseType: "arraybuffer",
    });
    res.set("Content-Type", "application/pdf");
    res.set("Content-Disposition", "attachment; filename=ewb-summary.pdf");
    res.send(response.data);
  } catch (error) {
    console.error('[Print Error]', error.response?.data || error.message);
    res
      .status(error?.response?.status || 500)
      .json(error?.response?.data || { error: "Print failed" });
  }
});

/* ======================================================================
   3. ONYX - ENTITY MANAGEMENT
   ====================================================================== */
// Assigned Place of Businesses (POB)
app.get("/proxy/mgmt/pob/list", (req, res) =>
  proxyRequest(res, () =>
    axios.get(`${BASE_URL}/irisgst/mgmt/user/getAssignedPlaceOfBusinesses`, {
      params: req.query,
      headers: { Accept: "application/json", ...authHeaders(req) },
    })
  )
);

// Business Hierarchy
app.get("/proxy/mgmt/businessHierarchy", (req, res) =>
  proxyRequest(res, () =>
    axios.get(`${BASE_URL}/irisgst/mgmt/company/businesshierarchy`, {
      params: req.query,
      headers: { Accept: "application/json", product: "ONYX", ...authHeaders(req) },
    })
  )
);

// Add Business / Branch
app.put("/proxy/mgmt/business/add", (req, res) =>
  proxyRequest(res, () =>
    axios.put(`${BASE_URL}/irisgst/mgmt/company/business`, req.body, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        product: "ONYX",
        ...authHeaders(req),
      },
    })
  )
);

/* ======================================================================
   START SERVER
   ====================================================================== */
const server = app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is busy. Try changing PORT in code.`);
  } else {
    console.error('Server startup error:', err);
  }
});