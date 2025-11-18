import React, { useState } from 'react';
import axios from 'axios';

const EWBActionForm = () => {
  const prevEwb = JSON.parse(localStorage.getItem('lastEWB')) || {};

  const [actionType, setActionType] = useState('UPDATE');
  const [formData, setFormData] = useState({
    ewbNo: prevEwb.ewbNo || '',
    vehicleNo: prevEwb.vehicleNo || '',
    fromPlace: prevEwb.fromPlace || '',
    fromState: prevEwb.fromState || '',
    reasonCode: '3',
    reasonRem: 'Vehicle is changed',
    transDocNo: prevEwb.transDocNo || '',
    transDocDate: prevEwb.transDocDate || '',
    transMode: prevEwb.transMode || 1,
    userGstin: prevEwb.userGstin || localStorage.getItem('userGstin') || '',
    vehicleType: prevEwb.vehicleType || 'R',
    companyId: prevEwb.companyId || localStorage.getItem('companyId') || '',
    // Cancel fields
    cancelRsnCode: '1',
    cancelRmrk: 'Order Cancelled',
    // Extend fields
    remainingDistance: '',
    extnRsnCode: '',
    extnRemarks: '',
    fromPincode: '',
    transitType: '',
    consignmentStatus: 'M',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState(null);

  const headers = {
    'X-Auth-Token': localStorage.getItem('token') || '',
    'companyId': formData.companyId,
    'product': 'TOPAZ',
    'Content-Type': 'application/json',
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Build dynamic payload based on selected action
  const buildPayload = () => {
    switch (actionType) {
      case 'UPDATE':
        return {
          ewbNo: formData.ewbNo,
          vehicleNo: formData.vehicleNo,
          fromPlace: formData.fromPlace,
          fromState: formData.fromState,
          reasonCode: formData.reasonCode,
          reasonRem: formData.reasonRem,
          transDocNo: formData.transDocNo,
          transDocDate: formData.transDocDate,
          transMode: formData.transMode,
          userGstin: formData.userGstin,
          vehicleType: formData.vehicleType,
          companyId: formData.companyId,
          action: 'UPDATE',
        };
      case 'CANCEL':
        return {
          ewbNo: formData.ewbNo,
          cancelRsnCode: formData.cancelRsnCode,
          cancelRmrk: formData.cancelRmrk,
          userGstin: formData.userGstin,
          companyId: formData.companyId,
          action: 'CANCEL',
        };
      case 'REJECT':
        return {
          ewbNo: formData.ewbNo,
          userGstin: formData.userGstin,
          companyId: formData.companyId,
          action: 'REJECT',
        };
      case 'EXTENDVALIDITY':
        return {
          ewbNo: formData.ewbNo,
          vehicleNo: formData.vehicleNo,
          fromPlace: formData.fromPlace,
          fromState: formData.fromState,
          remainingDistance: formData.remainingDistance,
          transDocNo: formData.transDocNo,
          transDocDate: formData.transDocDate,
          transMode: formData.transMode,
          extnRsnCode: formData.extnRsnCode,
          extnRemarks: formData.extnRemarks,
          userGstin: formData.userGstin,
          action: 'EXTENDVALIDITY',
          fromPincode: formData.fromPincode,
          transitType: formData.transitType,
          consignmentStatus: formData.consignmentStatus,
        };
      default:
        return {};
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);

    const payload = buildPayload();

    try {
      const res = await axios.put(
        'http://localhost:3001/proxy/topaz/ewb/action',
        payload,
        { headers }
      );

      setResponse(res.data);
      if (res.data.status === 'SUCCESS') {
        alert(`${actionType} successful!`);
      }
    } catch (err) {
      const errResp = err.response?.data || { message: err.message };
      setResponse(errResp);
      setError(errResp.message || 'Action failed');
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '20px' }}>
      <h2>EWB Action Form</h2>

      <label>Action Type:</label>
      <select
        value={actionType}
        onChange={(e) => setActionType(e.target.value)}
        style={{ marginBottom: '15px' }}
      >
        <option value="UPDATE">Update</option>
        <option value="CANCEL">Cancel</option>
        <option value="REJECT">Reject</option>
        <option value="EXTENDVALIDITY">Extend Validity</option>
      </select>

      <form onSubmit={handleSubmit}>
        {/* Common Field */}
        <input name="ewbNo" placeholder="EWB No" value={formData.ewbNo} onChange={handleChange} required />

        {/* Conditional Fields */}
        {actionType === 'UPDATE' && (
          <>
            <input name="vehicleNo" placeholder="Vehicle No" value={formData.vehicleNo} onChange={handleChange} />
            <input name="fromPlace" placeholder="From Place" value={formData.fromPlace} onChange={handleChange} />
            <input name="fromState" placeholder="From State" value={formData.fromState} onChange={handleChange} />
            <input name="transDocNo" placeholder="Transport Doc No" value={formData.transDocNo} onChange={handleChange} />
            <input name="transDocDate" placeholder="Transport Doc Date" value={formData.transDocDate} onChange={handleChange} />
            <input name="reasonCode" placeholder="Reason Code" value={formData.reasonCode} onChange={handleChange} />
            <input name="reasonRem" placeholder="Reason Remark" value={formData.reasonRem} onChange={handleChange} />
            <input name="vehicleType" placeholder="Vehicle Type" value={formData.vehicleType} onChange={handleChange} />
          </>
        )}

        {actionType === 'CANCEL' && (
          <>
            <input name="cancelRsnCode" placeholder="Cancel Reason Code" value={formData.cancelRsnCode} onChange={handleChange} />
            <input name="cancelRmrk" placeholder="Cancel Remark" value={formData.cancelRmrk} onChange={handleChange} />
          </>
        )}

        {actionType === 'EXTENDVALIDITY' && (
          <>
            <input name="vehicleNo" placeholder="Vehicle No" value={formData.vehicleNo} onChange={handleChange} />
            <input name="fromPlace" placeholder="From Place" value={formData.fromPlace} onChange={handleChange} />
            <input name="fromState" placeholder="From State" value={formData.fromState} onChange={handleChange} />
            <input name="remainingDistance" placeholder="Remaining Distance" value={formData.remainingDistance} onChange={handleChange} />
            <input name="transDocNo" placeholder="Transport Doc No" value={formData.transDocNo} onChange={handleChange} />
            <input name="transDocDate" placeholder="Transport Doc Date" value={formData.transDocDate} onChange={handleChange} />
            <input name="extnRsnCode" placeholder="Extension Reason Code" value={formData.extnRsnCode} onChange={handleChange} />
            <input name="extnRemarks" placeholder="Extension Remarks" value={formData.extnRemarks} onChange={handleChange} />
            <input name="fromPincode" placeholder="From Pincode" value={formData.fromPincode} onChange={handleChange} />
            <input name="transitType" placeholder="Transit Type" value={formData.transitType} onChange={handleChange} />
            <input name="consignmentStatus" placeholder="Consignment Status" value={formData.consignmentStatus} onChange={handleChange} />
          </>
        )}

        <button type="submit" disabled={loading} style={{ marginTop: '15px' }}>
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>

      {/* Request Info */}
      <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
        <h3>Request About to be Sent:</h3>
        <strong>Payload:</strong>
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(buildPayload(), null, 2)}
        </pre>
        <strong>Headers:</strong>
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(headers, null, 2)}
        </pre>
      </div>

      {/* API Response */}
      {response && (
        <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
          <h3>API Response:</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

export default EWBActionForm;
