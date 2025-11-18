import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EWBManager = () => {
  const [activeTab, setActiveTab] = useState('byDocType');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const companyId = localStorage.getItem('companyId');
  const defaultGstin = localStorage.getItem('userGstin') || '';

  // Forms for each tab
  const [byDocType, setByDocType] = useState({
    userGstin: defaultGstin,
    docType: 'INV',
    docNum: ''
  });

  const [fetchNIC, setFetchNIC] = useState({
    userGstin: defaultGstin,
    companyId: companyId || '',
    docType: 'INV',
    docNumList: ['']
  });

  const [statusQuery, setStatusQuery] = useState({
    userGstin: defaultGstin,
    companyId: companyId || ''
  });

  const [downloadQuery, setDownloadQuery] = useState({
    id: ''
  });

  const headers = {
    'X-Auth-Token': token,
    'companyId': companyId,
    'product': 'TOPAZ',
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      let res;
      switch (activeTab) {
        case 'byDocType':
          res = await axios.get(
            'http://localhost:3001/proxy/topaz/ewb/docNumAndType',
            { params: byDocType, headers }
          );
          break;

        case 'fetchNIC':
          res = await axios.post(
            'http://localhost:3001/proxy/topaz/ewb/docNum',
            fetchNIC,
            { headers }
          );
          break;

        case 'status':
          res = await axios.get(
            'http://localhost:3001/proxy/topaz/ewb/docNum/status',
            { params: statusQuery, headers }
          );
          break;

        case 'download':
          res = await axios.get(
            'http://localhost:3001/proxy/topaz/ewb/docNum/download',
            { params: downloadQuery, headers, responseType: 'blob' }
          );
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `EWB_${downloadQuery.id}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          res.data = { message: `Downloaded EWB_${downloadQuery.id}.pdf` };
          break;

        default:
          break;
      }

      setResponse(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Request failed');
    }
    setLoading(false);
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'byDocType':
        return (
          <>
            <input name="userGstin" placeholder="User GSTIN" value={byDocType.userGstin} onChange={(e) => setByDocType({ ...byDocType, userGstin: e.target.value })} required />
            <input name="docType" placeholder="Document Type" value={byDocType.docType} onChange={(e) => setByDocType({ ...byDocType, docType: e.target.value })} />
            <input name="docNum" placeholder="Document Number" value={byDocType.docNum} onChange={(e) => setByDocType({ ...byDocType, docNum: e.target.value })} required />
          </>
        );

      case 'fetchNIC':
        return (
          <>
            <input name="userGstin" placeholder="User GSTIN" value={fetchNIC.userGstin} onChange={(e) => setFetchNIC({ ...fetchNIC, userGstin: e.target.value })} required />
            <input name="companyId" placeholder="Company ID" value={fetchNIC.companyId} onChange={(e) => setFetchNIC({ ...fetchNIC, companyId: e.target.value })} required />
            <input name="docType" placeholder="Document Type" value={fetchNIC.docType} onChange={(e) => setFetchNIC({ ...fetchNIC, docType: e.target.value })} />
            <input name="docNumList" placeholder="Document Numbers (comma separated)" value={fetchNIC.docNumList} onChange={(e) => setFetchNIC({ ...fetchNIC, docNumList: e.target.value.split(',') })} required />
          </>
        );

      case 'status':
        return (
          <>
            <input name="userGstin" placeholder="User GSTIN" value={statusQuery.userGstin} onChange={(e) => setStatusQuery({ ...statusQuery, userGstin: e.target.value })} required />
            <input name="companyId" placeholder="Company ID" value={statusQuery.companyId} onChange={(e) => setStatusQuery({ ...statusQuery, companyId: e.target.value })} required />
          </>
        );

      case 'download':
        return <input name="id" placeholder="Request ID" value={downloadQuery.id} onChange={(e) => setDownloadQuery({ ...downloadQuery, id: e.target.value })} required />;

      default:
        return null;
    }
  };

  const currentPayload =
    activeTab === 'fetchNIC'
      ? fetchNIC
      : activeTab === 'download'
      ? downloadQuery
      : activeTab === 'status'
      ? statusQuery
      : byDocType;

  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '20px' }}>
      <h2>EWB Manager</h2>

      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => setActiveTab('byDocType')} disabled={activeTab === 'byDocType'}>Get by Doc Num & Type</button>
        <button onClick={() => setActiveTab('fetchNIC')} disabled={activeTab === 'fetchNIC'}>Fetch from NIC</button>
        <button onClick={() => setActiveTab('status')} disabled={activeTab === 'status'}>Fetch Status</button>
        <button onClick={() => setActiveTab('download')} disabled={activeTab === 'download'}>Download EWB</button>
      </div>

      <form onSubmit={handleSubmit}>
        {renderForm()}
        <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>

      <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '10px' }}>
        <h3>Request Info</h3>
        <strong>Headers:</strong>
        <pre>{JSON.stringify(headers, null, 2)}</pre>
        <strong>Payload / Query:</strong>
        <pre>{JSON.stringify(currentPayload, null, 2)}</pre>
      </div>

      {response && (
        <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '10px' }}>
          <h3>API Response:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

export default EWBManager;
