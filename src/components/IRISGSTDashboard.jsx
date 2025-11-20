import React, { useState } from "react";

// --- AUTHENTICATION ---
import LoginForm from "./Auth/LoginForm";
import ChangePasswordForm from "./Auth/ChangePasswordForm";

// --- EWAYBILL CORE ---
import FetchEWBByDate from "./EwaybillCore/FetchEWBByDate";
import GetEwbDetails from "./EwaybillCore/GetEwbDetails";
import GenerateEwb from "./EwaybillCore/GenerateEwb"; // CASE FIXED

// --- EWAYBILL ACTIONS ---
import FetchTransporterEwb from "./EwaybillActions/FetchTransporterEwb";
import UpdateCancelEwb from "./EwaybillActions/UpdateCancelEwb"; // CASE FIXED

// --- FETCH EWAYBILL ---
import FetchGeneratedEWB from "./FetchEWB/FetchGeneratedEWB";
import FetchOtherParties from "./FetchEWB/FetchOtherParties";

// --- CONSOLIDATE EWAYBILL ---
import CEWBDetails from "./ConsolidateEWB/CEWBDetails";   // FIXED PATH
import ByDocNumType from "./ConsolidateEWB/ByDocNumType"; // FIXED PATH

// --- GET EWB BY DOC NUMBER & TYPE ---
import BulkByDocNum from "./EWBByDoc/BulkByDocNum";
import BulkDownload from "./EWBByDoc/BulkDownload";
import BulkStatus from "./EWBByDoc/BulkStatus";
import FetchByDocNumType from "./EWBByDoc/FetchByDocNumType";

// --- MULTI-VEHICLE MANAGEMENT ---
import AddVehicle from "./MultiVehicle/AddVehicle";
import EditVehicle from "./MultiVehicle/EditVehicle";
import MultivehicleGroupDetails from "./MultiVehicle/MultiVehicleGroupDetails";
import MultiVehicleInitiate from "./MultiVehicle/MultiVehicleInitiate"; // CASE FIXED
import MultiVehicleRequests from "./MultiVehicle/MultiVehicleRequests"; // REMOVED TRAILING SPACE


// Pages
import PrintDetails from  "./pages/PrintEWB/PrintDetails";
import PrintSummary from "./pages/PrintEWB/PrintSummary";

// --- ENTITY MANAGEMENT ---
import AddBusiness from "./EntityManagement/AddBusiness";
import BusinessHierarchy from "./EntityManagement/BusinessHierarchy";
import AssignedGSTINList from "./EntityManagement/AssignedGSTINList";
import AssignedPoB from "./EntityManagement/AssignedPOB";




// --- SCHEMAS ---
import SchemasView from "./schemas/SchemasView";

const IRISGSTDashboard = () => {
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("irisgst_token") ? "ewb-generate" : "login"
  );
  const [sharedData, setSharedData] = useState({
    token: localStorage.getItem("irisgst_token") || "",
    companyId: localStorage.getItem("irisgst_companyId") || "",
    email: localStorage.getItem("irisgst_email") || "",
    generatedEwbNo: "",
    pobCompanyId: "",
  });

  const isAuthenticated = !!sharedData.token;

  const updateSharedData = (key, value) => {
    setSharedData((prev) => ({ ...prev, [key]: value }));
    if (["token", "companyId", "email"].includes(key)) {
      localStorage.setItem(`irisgst_${key}`, value);
    }
  };

  // --- Tab Labels ---
  const tabLabels = {
    login: "Login",
    "change-password": "Change Password",
    "ewb-generate": "Generate EWB",
    "ewb-details": "EWB Details",
    "ewb-bydate":"FetchewbBydate",
    "ewb-update-cancel": "Update / Cancel EWB",
    "update-transporter": "Update Transporter",
    "ewb-by-date": "Fetch EWB by Date",
    "ewb-other-parties": "Fetch Other Parties",
    "ewb-transporter-assigned": "Transporter Assigned",
    "cewb-details": "CEWB Details",
    "cewb-generate": "Generate CEWB",
    "ewb-by-doc-type": "EWB by Doc Type",
    "ewb-bulk-request": "Bulk Request",
    "ewb-bulk-status": "Bulk Status",
    "ewb-bulk-download": "Bulk Download",
    "add-vehicle": "Add Vehicle",
    "edit-vehicle": "Edit Vehicle",
    "group-details": "Group Details",
    "initiate": "Initiate",
    "list-requests": "List Requests",
    "print-details": "Print Details",
    "print-summary": "Print Summary",
    "assigned-pob": "Assigned POBs",
    "add-business": "Add Business",
    "business-hierarchy": "Business Hierarchy",
    "assigned-gstins": "Assigned GSTINs",
    schemas: "Schemas",
  };

  // --- Tab Map (Mapping tab keys to components) ---
  const tabMap = {
    login: (
      <LoginForm
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),
    "change-password": (
      <ChangePasswordForm
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),

    // EWAYBILL CORE
    "ewb-generate": (
      <GenerateEwb
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),
    "ewb-details": (
      <GetEwbDetails
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),

     "ewb-bydate": (
      <FetchEWBByDate
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),

    // EWAYBILL ACTIONS
    "ewb-update-cancel": (
      <UpdateCancelEwb
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),
    "update-transporter": (
      <UpdateCancelEwb
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),

    // FETCH EWAYBILL
    "ewb-by-date": (
      <FetchEWBByDate
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),
    "ewb-other-parties": (
      <FetchOtherParties
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),
    "ewb-transporter-assigned": (
      <FetchTransporterEwb
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),

    // CONSOLIDATE EWAYBILL
    "cewb-details": (
      <CEWBDetails
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),

    "cewb-generate": (
      <ByDocNumType
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),
    // GET EWB BY DOC NUMBER & TYPE
    "ewb-by-doc-type": (
      <FetchByDocNumType
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),
    "ewb-bulk-request": (
      <BulkByDocNum
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),
    "ewb-bulk-status": (
      <BulkStatus
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),
    "ewb-bulk-download": (
      <BulkDownload
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),

    // MULTI-VEHICLE MANAGEMENT (MAPPING TO EXACT IMPORTED NAMES)
    "add-vehicle": (
      <AddVehicle
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),
    "edit-vehicle": (
      <EditVehicle
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),
    "group-details": (
      <MultivehicleGroupDetails // Using the exact imported name
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),
    "initiate": (
      <MultiVehicleInitiate // Using the exact imported name
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),
    "list-requests": (
      <MultiVehicleRequests // Using the exact imported name
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),

    // PRINT EWAYBILL (In Sync mode)
    "print-details": (
      <PrintDetails
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),
    "print-summary": (
      <PrintSummary
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),

    // ENTITY MANAGEMENT
    "assigned-pob": (
      <AssignedPoB
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),
    "add-business": (
      <AddBusiness
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),
    "business-hierarchy": (
      <BusinessHierarchy
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),
    "assigned-gstins": (
      <AssignedGSTINList
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),

    // SCHEMAS
    schemas: (
      <SchemasView
        shared={sharedData}
        updateShared={updateSharedData}
        setActiveTab={setActiveTab}
      />
    ),
  };
  const sections = [
    { title: "Authentication", tabs: ["login", "change-password"] },
    { title: "Ewaybill Core", tabs: ["ewb-generate", "ewb-details","ewb-bydate"] },
    { title: "Ewaybill Actions",tabs: ["ewb-update-cancel", "update-transporter"]},
    { title: "Fetch Ewaybill", tabs: ["ewb-by-date", "ewb-other-parties", "ewb-transporter-assigned"]},
    { title: "Consolidate Ewaybill", tabs: ["cewb-details","cewb-generate"] },
    { title: "Get Ewaybill By Document Number & Type",tabs: ["ewb-by-doc-type","ewb-bulk-request","ewb-bulk-status","ewb-bulk-download"]},
    { title: "Multi-Vehicle",tabs: ["add-vehicle", "edit-vehicle", "group-details", "initiate", "list-requests"]},
    { title: "Print Ewaybill (In Sync mode)",tabs: ["print-details", "print-summary"]},
    { title: "Entity Management",tabs: ["assigned-pob", "add-business", "business-hierarchy", "assigned-gstins"]},
    { title: "Schemas", tabs: ["schemas"] },
  ];
  return (
    <div style={{ padding: 20 }}>
      <h1>IRISGST Dashboard</h1>
      {sections.map((section) => (
        <div key={section.title} style={{ marginBottom: 20 }}>
          <h3>{section.title}</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {section.tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 12px",
                  background: activeTab === tab ? "#007bff" : "#eee",
                  color: activeTab === tab ? "#fff" : "#000",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                }}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 30, padding: 20, border: "1px solid #ccc", borderRadius: 5 }}>
        {tabMap[activeTab] || <div style={{ color: "red" }}>Component Not Found</div>}
      </div>
    </div>
  );
};

export default IRISGSTDashboard;