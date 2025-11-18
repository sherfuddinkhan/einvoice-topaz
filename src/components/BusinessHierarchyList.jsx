import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BusinessHierarchyList = () => {
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const fetchHierarchy = async () => {
    try {
      const token = localStorage.getItem('token');
      const companyId = localStorage.getItem('companyId');
      const res = await axios.get('http://localhost:3001/proxy/topaz/businessHierarchy', {
        params: { companyid: companyId },
        headers: { 'X-Auth-Token': token, 'companyId': companyId, 'product': 'ONYX' }
      });
      setHierarchy(res.data.response || []);
    } catch (err) {
      setError('Fetch failed');
    }
    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: 'auto' }}>
      <h2>Business Hierarchy</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {hierarchy.map((item) => (
          <li key={item.id}>{item.companyname} - {item.gstin} ({item.roleName})</li>
        ))}
      </ul>
    </div>
  );
};

export default BusinessHierarchyList;