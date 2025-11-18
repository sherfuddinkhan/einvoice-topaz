import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EWBGenerateForm = () => {
  const defaultFormData = {
    supplyType: "O",
    subSupplyType: "1",
    docType: "INV",
    docNo: "Topaz340290",
    invType: "B2B",
    docDate: "15/11/2025",
    transactionType: 1,
    referencInum: null,
    referenceIdt: null,
    fromGstin: "05AAAAU1183B5ZW",
    fromTrdName: "ABC",
    dispatchFromGstin: "05AAAAU1183B5ZW",
    dispatchFromTradeName: "PQR",
    fromAddr1: "T231",
    fromAddr2: "IIP",
    fromPlace: "Akodiya",
    fromStateCode: 5,
    fromPincode: 248001,
    toGstin: "05AAAAU1183B1Z0",
    toTrdName: "RJ-Rawat Foods",
    toAddr1: "S531, SSB Towers",
    toAddr2: "MG Road",
    toPlace: "Dehradun",
    toPincode: 248002,
    toStateCode: 5,
    totInvValue: 21000.00,
    totalValue: 20000.00,
    cgstValue: 500.00,
    sgstValue: 500.00,
    igstValue: 0.00,
    cessValue: 0.00,
    cessNonAdvolValue: 0.00,
    otherValue: 0.00,
    transMode: 1,
    transDistance: 10,
    transDocDate: "15/11/2025",
    transDocNo: "1212",
    transporterId: "05AAAAU1183B1Z0",
    transporterName: "ACVDF",
    vehicleNo: "RJ14CA9999",
    actFromStateCode: "5",
    actToStateCode: "5",
    vehicleType: "R",
    itemList: [
      {
        productName: "Sugar",
        productDesc: "Sugar",
        hsnCode: "8517",
        quantity: 10,
        qtyUnit: "KGS",
        taxableAmount: 20000.00,
        sgstRate: 2.50,
        cgstRate: 2.50,
        igstRate: 0.00,
        cessRate: 0.00,
        cessNonAdvol: 0.00,
        iamt: 0.00,
        camt: 500.00,
        samt: 500.00,
        csamt: 0.00,
        txp: "T"
      }
    ],
    companyId: null,
    userGstin: "05AAAAU1183B5ZW",
    forceDuplicateCheck: true
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState(null);

  // Pre-fill companyId, token, and userGstin from previous login
  useEffect(() => {
    const companyId = localStorage.getItem('companyId');
    const token = localStorage.getItem('token');
    const userGstin = localStorage.getItem('userGstin') || localStorage.getItem('gstin');

    setFormData(prev => ({
      ...prev,
      companyId: companyId || prev.companyId,
      userGstin: userGstin || prev.userGstin,
      fromGstin: userGstin || prev.fromGstin,
      dispatchFromGstin: userGstin || prev.dispatchFromGstin,
      transporterId: userGstin || prev.transporterId
    }));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, e) => {
    const newItemList = [...formData.itemList];
    newItemList[index][e.target.name] = e.target.value;
    setFormData({ ...formData, itemList: newItemList });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      itemList: [
        ...formData.itemList,
        {
          productName: "",
          productDesc: "",
          hsnCode: "",
          quantity: 0,
          qtyUnit: "KGS",
          taxableAmount: 0,
          sgstRate: 0,
          cgstRate: 0,
          igstRate: 0,
          cessRate: 0,
          cessNonAdvol: 0,
          iamt: 0,
          camt: 0,
          samt: 0,
          csamt: 0,
          txp: "T"
        }
      ]
    });
  };

  const removeItem = (index) => {
    const newItemList = [...formData.itemList];
    newItemList.splice(index, 1);
    setFormData({ ...formData, itemList: newItemList });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);

    const headers = {
      'X-Auth-Token': localStorage.getItem('token'),
      'companyId': localStorage.getItem('companyId'),
      'product': 'TOPAZ',
      'Content-Type': 'application/json'
    };

    try {
      const res = await axios.post(
        'http://localhost:3001/proxy/topaz/ewb/generate',
        formData,
        { headers }
      );
      setResponse(res.data);
      alert('EWB generated! EWB No: ' + res.data.response.ewbNo);
    } catch (err) {
      const errorResponse = err.response?.data || { error: err.message };
      setResponse(errorResponse);
      setError(errorResponse.message || errorResponse.error || 'EWB generation failed');
    }

    setLoading(false);
  };

  const liveRequestInfo = {
    payload: formData,
    headers: {
      'X-Auth-Token': localStorage.getItem('token'),
      'companyId': localStorage.getItem('companyId'),
      'product': 'TOPAZ',
      'Content-Type': 'application/json'
    }
  };

  return (
    <div style={{ maxWidth: '950px', margin: 'auto', padding: '20px' }}>
      <h2>Generate EWB</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).filter(k => k !== 'itemList').map(key => (
          <input
            key={key}
            name={key}
            placeholder={key}
            value={formData[key] ?? ''}
            onChange={handleChange}
            style={{ display: 'block', margin: '6px 0', width: '100%', padding: '6px' }}
          />
        ))}

        <h3>Item List</h3>
        {formData.itemList.map((item, index) => (
          <div key={index} style={{ border: '1px solid #ccc', margin: '6px 0', padding: '6px', borderRadius: '4px' }}>
            {Object.keys(item).map(attr => (
              <input
                key={attr}
                name={attr}
                placeholder={attr}
                value={item[attr]}
                onChange={e => handleItemChange(index, e)}
                style={{ display: 'block', margin: '4px 0', width: '100%', padding: '4px' }}
              />
            ))}
            <button type="button" onClick={() => removeItem(index)} style={{ marginTop: '4px' }}>Remove Item</button>
          </div>
        ))}
        <button type="button" onClick={addItem} style={{ margin: '6px 0', padding: '6px' }}>Add Item</button>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', marginTop: '10px' }}>
          {loading ? 'Generating...' : 'Generate EWB'}
        </button>
      </form>

      {/* Show live payload & headers */}
      <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
        <h3>Request About to be Sent:</h3>
        <strong>Payload:</strong>
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(liveRequestInfo.payload, null, 2)}
        </pre>
        <strong>Headers:</strong>
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(liveRequestInfo.headers, null, 2)}
        </pre>
      </div>

      {/* Show API Response */}
      {response && (
        <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
          <h3>API Response:</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(response, null, 2)}
          </pre>
          {response.response?.qrCode && (
            <img src={`data:image/png;base64,${response.response.qrCode}`} alt="QR Code" style={{ marginTop: '10px', maxWidth: '200px' }} />
          )}
        </div>
      )}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

export default EWBGenerateForm;
