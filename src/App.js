import { Routes, Route } from "react-router-dom";
import IRISGSTDashboard from "./components/IRISGSTDashboard";
import UpdateCancelEwb from "./components/EwaybillActions/UpdateCancelEwb";

function App() {
  return (
    <Routes>
      <Route path="/*" element={<IRISGSTDashboard />} /> {/* All dashboard tabs */}
      <Route path="/ewb-action/:ewbNo" element={<UpdateCancelEwb/>} />
    </Routes>
  );
}

export default App;
