-- Soberanía 100: Persistencia anti-frágil del Ledger
CREATE TABLE IF NOT EXISTS Sovereign_Ledger (
    entry_id UUID PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    federation_origin INT CHECK (federation_origin BETWEEN 1 AND 7),
    data_payload JSONB NOT NULL,
    integrity_hash VARCHAR(256),
    status VARCHAR(50) DEFAULT 'STABLE'
);

CREATE OR REPLACE VIEW Identity_Integrity AS
SELECT
    entry_id,
    data_payload->>'architect' AS creator,
    data_payload->>'vision' AS strategic_alignment
FROM Sovereign_Ledger
WHERE data_payload->>'project' = 'TAMV_ONLINE';
