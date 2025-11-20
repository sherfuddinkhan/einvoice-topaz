import React, { useState, useEffect } from "react";
import axios from 'axios';

// --- LocalStorage Keys ---
const LOGIN_RESPONSE_KEY = "iris_login_data";
const LATEST_EWB_KEY = "latestEwbData"; 

// --- Helper function to safely parse and retrieve data ---
const getLocalStorageData = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key) || "{}");
    } catch (e) {
        console.error(`Error parsing Local Storage key ${key}:`, e);
        return {};
    }
};

const UpdateCancelEwb = () => {
    
    const [authData, setAuthData] = useState({
        token: '',
        companyId: '',
        userGstin: '',
    });

    const [actionType, setActionType] = useState('UPDATE');
    
    const [formData, setFormData] = useState({
        // Common
        ewbNo: '',
        // Update/Extend
        vehicleNo: '',
        fromPlace: '',
        fromState: '', 
        reasonCode: '3',
        reasonRem: 'Vehicle is changed',
        transDocNo: '',
        transDocDate: '',
        transMode: 1,
        vehicleType: 'R',
        // Cancel
        cancelRsnCode: '1',
        cancelRmrk: 'Order Cancelled',
        // Extend
        remainingDistance: '',
        extnRsnCode: '',
        extnRemarks: '',
        fromPincode: '',
        transitType: 'T',
        consignmentStatus: 'M',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [response, setResponse] = useState(null);

    // -----------------------------------------------------------
    // 🔵 Load Auth + EWB Data on Mount (Single Source of Truth)
    // -----------------------------------------------------------
    useEffect(() => {
        const login = getLocalStorageData(LOGIN_RESPONSE_KEY);
        const latestEwb = getLocalStorageData(LATEST_EWB_KEY);
        const prevEwb = latestEwb?.response || {}; // The actual EWB details

        // 1. Determine the best GSTIN to use
        const loadedGstin = login.userGstin || prevEwb.fromGstin || prevEwb.userGstin || '';
        
        // 2. Set Auth Data
        setAuthData({
            token: login.token || '',
            companyId: login.companyId || '',
            userGstin: loadedGstin,
        });

        // 3. Set Form Data (Auto-population)
        setFormData(prev => ({
            ...prev,
            ewbNo: prevEwb.ewbNo || '',
            vehicleNo: prevEwb.vehicleNo || '',
            fromPlace: prevEwb.fromPlace || '',
            fromState: prevEwb.fromStateCode || '', // Map state code
            transDocNo: prevEwb.transDocNo || '',
            transDocDate: prevEwb.transDocDate || '',
            transMode: prevEwb.transMode || 1,
            vehicleType: prevEwb.vehicleType || 'R',
            fromPincode: prevEwb.fromPincode || '',
        }));
    }, []);

    // Headers derived from current authData state
    const headers = {
        'X-Auth-Token': authData.token,
        'companyId': authData.companyId,
        'product': 'TOPAZ',
        'Content-Type': 'application/json',
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Build dynamic payload based on selected action
    const buildPayload = () => {
        // Use authData directly for critical fields in the payload
        const commonPayload = {
            ewbNo: formData.ewbNo,
            userGstin: authData.userGstin, // CRITICAL: Use authData GSTIN
            companyId: authData.companyId, // CRITICAL: Use authData Company ID
            action: actionType,
        };

        switch (actionType) {
            case 'UPDATE':
                return {
                    ...commonPayload,
                    vehicleNo: formData.vehicleNo,
                    fromPlace: formData.fromPlace,
                    fromState: formData.fromState,
                    reasonCode: formData.reasonCode,
                    reasonRem: formData.reasonRem,
                    transDocNo: formData.transDocNo,
                    transDocDate: formData.transDocDate,
                    transMode: formData.transMode,
                    vehicleType: formData.vehicleType,
                };
            case 'CANCEL':
                return {
                    ...commonPayload,
                    cancelRsnCode: formData.cancelRsnCode,
                    cancelRmrk: formData.cancelRmrk,
                };
            case 'REJECT':
                return commonPayload;
                
            case 'EXTENDVALIDITY':
                return {
                    ...commonPayload,
                    vehicleNo: formData.vehicleNo,
                    fromPlace: formData.fromPlace,
                    fromState: formData.fromState,
                    remainingDistance: Number(formData.remainingDistance),
                    transDocNo: formData.transDocNo,
                    transDocDate: formData.transDocDate,
                    transMode: Number(formData.transMode),
                    extnRsnCode: formData.extnRsnCode,
                    extnRemarks: formData.extnRemarks,
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
        
        // --- CRITICAL SUBMISSION GUARD ---
        if (!authData.userGstin || !authData.companyId || !authData.token) {
            setError("🔴 AUTH FAILURE: Missing User GSTIN, Company ID, or Auth Token. Please log in again.");
            setLoading(false);
            return; 
        }
        if (!formData.ewbNo) {
             setError("🔴 Validation Error: EWB Number is mandatory.");
             setLoading(false);
             return;
        }
        // --- END GUARD ---
        
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
                alert(`${actionType} successful! EWB No: ${formData.ewbNo}`);
            }
        } catch (err) {
            const errResp = err.response?.data || { message: err.message };
            setResponse(errResp);
            setError(errResp.message || 'API Action failed'); 
        }

        setLoading(false);
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        margin: '5px 0 10px 0',
        boxSizing: 'border-box',
    };

    return (
        <div style={{ maxWidth: '700px', margin: 'auto', padding: '20px' }}>
            <h2>EWB Action Form</h2>

            {/* Display Current Auth Status */}
            <div style={{ padding: '10px', border: '1px solid #ccc', marginBottom: '15px', fontSize: '0.9em', background: '#fff3cd', borderColor: '#ffeeba' }}>
                <p><strong>GSTIN (Payload):</strong> {authData.userGstin || '🚫 Missing'}</p>
                <p><strong>Company ID (Header):</strong> {authData.companyId || '🚫 Missing'}</p>
                <p><strong>Token:</strong> {authData.token ? '✅ Loaded' : '🚫 Missing'}</p>
                {(!authData.userGstin || !authData.companyId || !authData.token) && (
                    <p style={{color: '#856404'}}>
                        **CRITICAL:** Please ensure you have successfully logged in recently, as authentication data is required.
                    </p>
                )}
            </div>
            
            <div style={{ marginBottom: '15px' }}>
                <label>Action Type:</label>
                <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    style={inputStyle}
                >
                    <option value="UPDATE">Update Vehicle</option>
                    <option value="CANCEL">Cancel EWB</option>
                    <option value="REJECT">Reject EWB</option>
                    <option value="EXTENDVALIDITY">Extend Validity</option>
                </select>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Always Required Fields */}
                <input name="ewbNo" placeholder="EWB No" value={formData.ewbNo} onChange={handleChange} style={inputStyle} required />

                {/* Conditional Fields */}
                {actionType === 'UPDATE' && (
                    <>
                        <input name="vehicleNo" placeholder="Vehicle No" value={formData.vehicleNo} onChange={handleChange} style={inputStyle} required/>
                        <input name="fromPlace" placeholder="From Place" value={formData.fromPlace} onChange={handleChange} style={inputStyle} required/>
                        <input name="fromState" placeholder="From State Code" value={formData.fromState} onChange={handleChange} style={inputStyle} required/>
                        <input name="transDocNo" placeholder="Transport Doc No" value={formData.transDocNo} onChange={handleChange} style={inputStyle} required/>
                        <input name="transDocDate" placeholder="Transport Doc Date (DD/MM/YYYY)" value={formData.transDocDate} onChange={handleChange} style={inputStyle} required/>
                        <input name="reasonCode" placeholder="Reason Code (e.g., 3)" value={formData.reasonCode} onChange={handleChange} style={inputStyle} required/>
                        <input name="reasonRem" placeholder="Reason Remark" value={formData.reasonRem} onChange={handleChange} style={inputStyle} required/>
                        <input name="vehicleType" placeholder="Vehicle Type (R/O)" value={formData.vehicleType} onChange={handleChange} style={inputStyle} required/>
                    </>
                )}

                {actionType === 'CANCEL' && (
                    <>
                        <input name="cancelRsnCode" placeholder="Cancel Reason Code (1-9)" value={formData.cancelRsnCode} onChange={handleChange} style={inputStyle} required/>
                        <input name="cancelRmrk" placeholder="Cancel Remark" value={formData.cancelRmrk} onChange={handleChange} style={inputStyle} required/>
                    </>
                )}
                
                {actionType === 'EXTENDVALIDITY' && (
                    <>
                        <input name="vehicleNo" placeholder="Vehicle No" value={formData.vehicleNo} onChange={handleChange} style={inputStyle} required/>
                        <input name="fromPlace" placeholder="From Place" value={formData.fromPlace} onChange={handleChange} style={inputStyle} required/>
                        <input name="fromState" placeholder="From State Code" value={formData.fromState} onChange={handleChange} style={inputStyle} required/>
                        <input name="fromPincode" placeholder="From Pincode" value={formData.fromPincode} onChange={handleChange} style={inputStyle} required/>
                        <input name="remainingDistance" placeholder="Remaining Distance (in Km)" value={formData.remainingDistance} onChange={handleChange} style={inputStyle} required/>
                        <input name="transDocNo" placeholder="Transport Doc No" value={formData.transDocNo} onChange={handleChange} style={inputStyle} required/>
                        <input name="transDocDate" placeholder="Transport Doc Date (DD/MM/YYYY)" value={formData.transDocDate} onChange={handleChange} style={inputStyle} required/>
                        <input name="extnRsnCode" placeholder="Extension Reason Code (1-8)" value={formData.extnRsnCode} onChange={handleChange} style={inputStyle} required/>
                        <input name="extnRemarks" placeholder="Extension Remarks" value={formData.extnRemarks} onChange={handleChange} style={inputStyle} required/>
                        <input name="transitType" placeholder="Transit Type (T/D)" value={formData.transitType} onChange={handleChange} style={inputStyle} required/>
                        <input name="consignmentStatus" placeholder="Consignment Status (M/T)" value={formData.consignmentStatus} onChange={handleChange} style={inputStyle} required/>
                    </>
                )}

                <button type="submit" disabled={loading} style={{ marginTop: '15px', padding: '10px 20px' }}>
                    {loading ? 'Processing...' : `Submit ${actionType}`}
                </button>
            </form>

            <hr style={{ marginTop: '20px' }}/>

            {/* API Response */}
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            {response && (
                <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                    <h3>API Response:</h3>
                    <pre style={{ background: '#e8f5ff', padding: '10px', overflow: 'auto' }}>
                        {JSON.stringify(response, null, 2)}
                    </pre>
                </div>
            )}
            
             {/* Request Info */}
            <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                <h3>Request Payload (Final):</h3>
                <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
                    {JSON.stringify(buildPayload(), null, 2)}
                </pre>
                <strong>Headers:</strong>
                <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
                    {JSON.stringify(headers, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default UpdateCancelEwb;