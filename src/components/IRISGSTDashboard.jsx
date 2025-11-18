import React, { useState } from "react";

// Authentication
import LoginForm from "./LoginForm";
import ChangePasswordForm from "./ChangePasswordForm";

// Ewaybill Core
import EWBGenerateForm from "./EWBGenerateForm";
import EWBFetchForm from "./EWBFetchForm";
import CEWBGenerateForm from "./CEWBGenerateForm";
import CEWBDetails from "./CEWBDetails";


// Ewaybill Actions
import EWBActionForm from "./EWBActionForm";
import TransporterUpdaterForm from "./TransporterUpdaterForm";

// Vehicle / EWB related
import MultiVehicleForm from "./MultiVehicleForm";
import EWBPrintForm from "./EWBPrintForm";
import EWBPrintSummary from "./EWBPrintSummary";

// Business / POB
import POBList from "./POBList";
import AddBusinessForm from "./AddBusinessForm";
import BusinessHierarchyList from "./BusinessHierarchyList";
import AssignedGSTINList from "./AssignedGSTINList";

const IRISGSTDashboard = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [sharedData, setSharedData] = useState({
    token: localStorage.getItem("token") || "",
    companyId: localStorage.getItem("companyId") || "",
    email: localStorage.getItem("email") || "",
    generatedEwbNo: "",
    pobCompanyId: ""
  });

  const isAuthenticated = !!sharedData.token;

  const updateSharedData = (key, value) => {
    setSharedData((prev) => ({ ...prev, [key]: value }));
    localStorage.setItem(key, value);
  };

  // TAB COMPONENT MAPPING
  const tabMap = {
    // Authentication
    login: <LoginForm shared={sharedData} updateShared={updateSharedData} setActiveTab={setActiveTab} />,
    "change-password": <ChangePasswordForm shared={sharedData} updateShared={updateSharedData} setActiveTab={setActiveTab} />,

    // Ewaybill Core
    "ewb-generate": <EWBGenerateForm shared={sharedData} updateShared={updateSharedData} setActiveTab={setActiveTab} />,
    "ewb-fetch": <EWBFetchForm shared={sharedData} updateShared={updateSharedData} setActiveTab={setActiveTab} />,
    "cewb-generate": <CEWBGenerateForm shared={sharedData} updateShared={updateSharedData} setActiveTab={setActiveTab} />,
    "cewb-details": <CEWBDetails shared={sharedData} updateShared={updateSharedData} setActiveTab={setActiveTab} />,
    

    // Ewaybill Actions
    "ewb-actions": <EWBActionForm shared={sharedData} updateShared={updateSharedData} setActiveTab={setActiveTab} />,
    "update-transporter": <TransporterUpdaterForm shared={sharedData} updateShared={updateSharedData} setActiveTab={setActiveTab} />,

    // Multi-Vehicle
    "multi-vehicle": <MultiVehicleForm shared={sharedData} updateShared={updateSharedData} setActiveTab={setActiveTab} />,

    // Print
    "print-ewb": <EWBPrintForm shared={sharedData} updateShared={updateSharedData} setActiveTab={setActiveTab} />,
    "print-ewb-summary": <EWBPrintSummary shared={sharedData} updateShared={updateSharedData} setActiveTab={setActiveTab} />,

    // Entity / Business Management
    "entity-management": <POBList shared={sharedData} updateShared={updateSharedData} setActiveTab={setActiveTab} />,
    "add-business": <AddBusinessForm shared={sharedData} updateShared={updateSharedData} setActiveTab={setActiveTab} />,
    "business-hierarchy": <BusinessHierarchyList shared={sharedData} updateShared={updateSharedData} setActiveTab={setActiveTab} />,
    "assigned-gstins": <AssignedGSTINList shared={sharedData} updateShared={updateSharedData} setActiveTab={setActiveTab} />
  };

  // TAB SECTIONS
  const sections = [
    {
      title: "Authentication",
      tabs: ["login", "change-password"]
    },
    {
      title: "Ewaybill Core",
      tabs: ["ewb-generate", "ewb-fetch", "cewb-generate", "cewb-details"]
    },
    {
      title: "Ewaybill Actions",
      tabs: ["ewb-actions", "update-transporter"]
    },
    {
      title: "Multi-Vehicle",
      tabs: ["multi-vehicle"]
    },
    {
      title: "Print",
      tabs: ["print-ewb", "print-ewb-summary"]
    },
    {
      title: "Entity Management",
      tabs: ["entity-management", "add-business", "business-hierarchy", "assigned-gstins"]
    }
  ];

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>IRISGST Dashboard</h1>

      {sections.map((section) => (
        <div key={section.title} style={{ marginBottom: "20px" }}>
          <h3>{section.title}</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {section.tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                disabled={!isAuthenticated && section.title !== "Authentication"}
                style={{
                  padding: "8px 12px",
                  background: activeTab === tab ? "#007bff" : "#eee",
                  color: activeTab === tab ? "white" : "black",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                {tab.replace("-", " ").toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* TAB CONTENT */}
      <div style={{ marginTop: "20px" }}>
        {tabMap[activeTab] || <div>Tab not found</div>}
      </div>
    </div>
  );
};

export default IRISGSTDashboard;
