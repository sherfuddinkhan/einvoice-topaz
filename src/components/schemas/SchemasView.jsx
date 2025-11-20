import React, { useState } from "react";
import { Card, Input, Button } from "antd";

const schemasList = [
  { name: "EWB Generate Schema", file: "generate_ewb_schema.json" },
  { name: "EWB Update/Cancel Schema", file: "update_cancel_ewb_schema.json" },
  { name: "EWB Transporter Update Schema", file: "update_transporter_schema.json" },
  { name: "EWB Multi-Vehicle Schema", file: "multi_vehicle_schema.json" },
  { name: "EWB Consolidated EWB Schema", file: "consolidated_ewb_schema.json" },
  { name: "EWB Print Schema", file: "print_ewb_schema.json" },
  { name: "IRIS Authentication Schema", file: "auth_schema.json" },
  { name: "IRIS Entity Management Schema", file: "entity_schema.json" },
];

const SchemasView = () => {
  const [search, setSearch] = useState("");

  const filteredSchemas = schemasList.filter((schema) =>
    schema.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleView = (file) => {
    alert(`Schema View: ${file}\n\nYou can integrate an online viewer here.`);
  };

  const handleDownload = (file) => {
    alert(`Trigger file download for: ${file}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Schemas</h2>

      <Input
        placeholder="Search schemas..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ maxWidth: 350, marginBottom: 20 }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {filteredSchemas.map((schema, idx) => (
          <Card key={idx} style={{ borderRadius: 10 }} bordered>
            <h3 style={{ marginBottom: 10 }}>{schema.name}</h3>

            <div style={{ display: "flex", gap: 10 }}>
              <Button type="primary" onClick={() => handleView(schema.file)}>
                View
              </Button>

              <Button onClick={() => handleDownload(schema.file)}>
                Download
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SchemasView;
