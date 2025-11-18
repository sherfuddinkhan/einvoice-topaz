import React, { useState, useEffect } from 'react';
import axios from 'axios';

const POBList = () => {
  const [pobs, setPobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPOBs();
  }, []);

  const fetchPOBs = async () => {
    try {
      const token = localStorage.getItem('token');
      const companyId = localStorage.getItem('companyId');
      const res = await axios.get('http://localhost:3001/onyx/pob/assigned', {
        params: { companyId },
       headers: {
                'Accept': 'application/json',
                'X-Auth-Token': token,
                'companyId': companyId,  // Now valid
                'product': 'ONYX'
  }
      });
      setPobs(res.data.response || []);
    } catch (err) {
      setError('Fetch failed');
    }
    setLoading(false);
  };

  if (loading) return <p>Loading POBs...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: 'auto' }}>
      <h2>Assigned Places of Business</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>Company Name</th><th>GSTIN</th><th>Pincode</th><th>State Code</th><th>Principal?</th></tr>
        </thead>
        <tbody>
          {pobs.map((pob) => (
            <tr key={pob.companyId}>
              <td>{pob.companyName}</td>
              <td>{pob.gstin || pob.gstinno}</td>
              <td>{pob.cmpPincode}</td>
              <td>{pob.stateCode}</td>
              <td>{pob.isPrincipalPob ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default POBList;