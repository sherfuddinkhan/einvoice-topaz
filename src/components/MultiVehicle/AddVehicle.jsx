// MultiVehicleAdd - src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AddVehicle(){
  const [headers, setHeaders] = useState({
    "X-Auth-Token": localStorage.getItem("token") || "",
    companyId: localStorage.getItem("companyId") || "",
    product: "TOPAZ",
    "Content-Type": "application/json",
  });

  const [payload, setPayload] = useState({
    groupNo: "",
    vehicleNo: "",
    quantity: "",
    transDocNo: "",
    transDocDate: "",
    userGstin: ""
  });

  const [resp, setResp] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=> {
    const saved = JSON.parse(localStorage.getItem("mv_add_payload") || "{}");
    setPayload(p => ({...p, ...saved}));
  },[]);

  useEffect(()=> localStorage.setItem("mv_add_payload", JSON.stringify(payload)), [payload]);

  const onH=(k,v)=> setHeaders(h=>({...h,[k]:v}));
  const onP=(k,v)=> setPayload(p=>({...p,[k]:v}));

  const submit = async () => {
    setLoading(true); setErr(null); setResp(null);
    try {
      const res = await axios.post("http://localhost:3001/proxy/topaz/multiVehicle/add", payload, { headers });
      setResp(res.data);
    } catch(e){
      setErr(e.response?.data||e.message);
    } finally { setLoading(false);}
  };

  return (
    <div style={{padding:20, maxWidth:800, margin:"auto"}}>
      <h2>Multi-Vehicle — Add Vehicle</h2>

      <div>
        <h3>Headers</h3>
        {Object.entries(headers).map(([k,v])=>(
          <div key={k}><label style={{width:140, display:"inline-block"}}>{k}</label>
            <input style={{width:420}} value={v} onChange={e=>onH(k,e.target.value)} />
          </div>
        ))}
      </div>

      <div style={{marginTop:12}}>
        <h3>Payload</h3>
        {Object.entries(payload).map(([k,v])=>(
          <div key={k}><label style={{width:140, display:"inline-block"}}>{k}</label>
            <input style={{width:420}} value={v} onChange={e=>onP(k,e.target.value)} />
          </div>
        ))}
      </div>

      <div style={{marginTop:12}}>
        <button onClick={submit} disabled={loading}>{loading?"Processing...":"Submit Add"}</button>
      </div>

      <div style={{marginTop:12}}>
        {err && <pre style={{color:"red"}}>{JSON.stringify(err,null,2)}</pre>}
        {resp && <pre>{JSON.stringify(resp,null,2)}</pre>}
      </div>
    </div>
  );
}
