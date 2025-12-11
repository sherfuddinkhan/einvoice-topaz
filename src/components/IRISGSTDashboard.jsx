import React, { useState } from "react";
import { Layout, Menu } from "antd";
import {AppstoreOutlined,FileTextOutlined,CarOutlined,FolderOpenOutlined,ApartmentOutlined,ToolOutlined,ProfileOutlined,
  UnlockOutlined,LoginOutlined,DatabaseOutlined} from "@ant-design/icons";



// --- IMPORTS (YOUR SAME COMPONENTS) ---
import LoginForm from "./Auth/LoginForm";
import ChangePasswordForm from "./Auth/ChangePasswordForm";
import FetchEWBByDate from "./EwaybillCore/FetchEWBByDate";
import GetEwbDetails from "./EwaybillCore/GetEwbDetails";
import GenerateEwb from "./EwaybillCore/GenerateEwb";
import UpdateTransporterId from "./EwaybillActions/UpdateTransporterId";
import UpdateCancelEwb from "./EwaybillActions/UpdateCancelEwb";
import FetchByDate from "./FetchEWB/FetchByDate";
import FetchOtherParties from "./FetchEWB/FetchOtherParties";
import AssignedEwbTransporter from "./FetchEWB/AssignedEwbTransporter";
import CEWBDetails from "./ConsolidateEWB/CEWBDetails";
import ByDocNumType from "./ConsolidateEWB/ByDocNumType";
import BulkByDocNum from "./EWBByDoc/BulkByDocNum";
import BulkDownload from "./EWBByDoc/BulkDownload";
import BulkStatus from "./EWBByDoc/BulkStatus";
import FetchByDocNumType from "./EWBByDoc/FetchByDocNumType";
import AddVehicle from "./MultiVehicle/AddVehicle";
import EditVehicle from "./MultiVehicle/EditVehicle";
import MultivehicleGroupDetails from "./MultiVehicle/MultiVehicleGroupDetails";
import MultiVehicleInitiate from "./MultiVehicle/MultiVehicleInitiate";
import MultiVehicleRequests from "./MultiVehicle/MultiVehicleRequests";
import PrintDetails from "./pages/PrintEWB/PrintDetails";
import PrintSummary from "./pages/PrintEWB/PrintSummary";
import AddBusiness from "./EntityManagement/AddBusiness";
import BusinessHierarchy from "./EntityManagement/BusinessHierarchy";
import AssignedGSTINList from "./EntityManagement/AssignedGSTINList";
import AssignedPoB from "./EntityManagement/AssignedPOB";
import SchemasView from "./schemas/SchemasView";

const { Sider, Content, Header } = Layout;

const IRISGSTDashboard = () => {
  const [activeTab, setActiveTab] = useState("ewb-generate");

  const tabMap = {
    login: <LoginForm />,
    "change-password": <ChangePasswordForm />,
    "ewb-generate": <GenerateEwb />,
    "ewb-details": <GetEwbDetails />,
    "ewb-bydate": <FetchEWBByDate />,
    "ewb-update-cancel": <UpdateCancelEwb />,
    "update-transporter": <UpdateTransporterId />,
    "ewb-by-date": <FetchByDate />,
    "ewb-other-parties": <FetchOtherParties />,
    "ewb-transporter-assigned": <AssignedEwbTransporter />,
    "cewb-details": <CEWBDetails />,
    "cewb-generate": <ByDocNumType />,
    "ewb-by-doc-type": <FetchByDocNumType />,
    "ewb-by-doc": <BulkByDocNum />,
    "ewb-bulk-status": <BulkStatus />,
    "ewb-bulk-download": <BulkDownload />,
    "add-vehicle": <AddVehicle />,
    "edit-vehicle": <EditVehicle />,
    "group-details": <MultivehicleGroupDetails />,
    "initiate": <MultiVehicleInitiate />,
    "list-requests": <MultiVehicleRequests />,
    "print-details": <PrintDetails />,
    "print-summary": <PrintSummary />,
    "assigned-pob": <AssignedPoB />,
    "add-business": <AddBusiness />,
    "business-hierarchy": <BusinessHierarchy />,
    "assigned-gstins": <AssignedGSTINList />,
    schemas: <SchemasView />,
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider theme="light" width={280}>
        <h2 style={{ padding: 16, textAlign: "center", fontWeight: "bold" }}>
          IRISGST Dashboard
        </h2>

        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={(e) => setActiveTab(e.key)}
        >
          <Menu.SubMenu key="auth" icon={<UnlockOutlined />} title="Authentication">
            <Menu.Item key="login" icon={<LoginOutlined />}>Login</Menu.Item>
            <Menu.Item key="change-password">Change Password</Menu.Item>
          </Menu.SubMenu>

          <Menu.SubMenu key="core" icon={<FileTextOutlined />} title="Ewaybill Core">
            <Menu.Item key="ewb-generate">Generate EWB</Menu.Item>
            <Menu.Item key="ewb-details">EWB Details</Menu.Item>
            <Menu.Item key="ewb-bydate">Fetch by Date</Menu.Item>
          </Menu.SubMenu>

          <Menu.SubMenu key="actions" icon={<ToolOutlined />} title="Ewaybill Actions">
            <Menu.Item key="ewb-update-cancel">Update / Cancel</Menu.Item>
            <Menu.Item key="update-transporter">Update Transporter</Menu.Item>
          </Menu.SubMenu>

          <Menu.SubMenu key="fetch" icon={<DatabaseOutlined />} title="Fetch EWB">
            <Menu.Item key="ewb-by-date">Fetch by Date</Menu.Item>
            <Menu.Item key="ewb-other-parties">Other Parties</Menu.Item>
            <Menu.Item key="ewb-transporter-assigned">Transporter Assigned</Menu.Item>
          </Menu.SubMenu>

          <Menu.SubMenu key="cewb" icon={<FolderOpenOutlined />} title="Consolidated EWB">
            <Menu.Item key="cewb-details">CEWB Details</Menu.Item>
            <Menu.Item key="cewb-generate">Generate CEWB</Menu.Item>
          </Menu.SubMenu>

          <Menu.SubMenu key="doc" icon={<ProfileOutlined />} title="By Document & Type">
            <Menu.Item key="ewb-by-doc-type">By Doc Type</Menu.Item>
            <Menu.Item key="ewb-by-doc">Bulk By Doc</Menu.Item>
            <Menu.Item key="ewb-bulk-status">Bulk Status</Menu.Item>
            <Menu.Item key="ewb-bulk-download">Bulk Download</Menu.Item>
          </Menu.SubMenu>

          <Menu.SubMenu key="multi" icon={<CarOutlined />} title="Multi-Vehicle">
            <Menu.Item key="add-vehicle">Add Vehicle</Menu.Item>
            <Menu.Item key="edit-vehicle">Edit Vehicle</Menu.Item>
            <Menu.Item key="group-details">Group Details</Menu.Item>
            <Menu.Item key="initiate">Initiate</Menu.Item>
            <Menu.Item key="list-requests">List Requests</Menu.Item>
          </Menu.SubMenu>

          <Menu.SubMenu key="print" icon={<AppstoreOutlined />} title="Print EWB">
            <Menu.Item key="print-details">Print Details</Menu.Item>
            <Menu.Item key="print-summary">Print Summary</Menu.Item>
          </Menu.SubMenu>

          <Menu.SubMenu key="entity" icon={<ApartmentOutlined />} title="Entity Management">
            <Menu.Item key="assigned-pob">Assigned POB</Menu.Item>
            <Menu.Item key="add-business">Add Business</Menu.Item>
            <Menu.Item key="business-hierarchy">Business Hierarchy</Menu.Item>
            <Menu.Item key="assigned-gstins">Assigned GSTINs</Menu.Item>
          </Menu.SubMenu>

          <Menu.Item key="schemas" icon={<AppstoreOutlined />}>Schemas</Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header style={{ background: "#fff", paddingLeft: 20 }}>
          <h2>{activeTab.toUpperCase()}</h2>
        </Header>

        <Content style={{ padding: 20, overflowY: "scroll" }}>
          {tabMap[activeTab]}
        </Content>
      </Layout>
    </Layout>
  );
};

export default IRISGSTDashboard;
