INSERT INTO public.federation_data_streams
  (source_repo, federation, stream_type, payload, integrity_hash, upstream_repo, downstream_repo, sync_status, last_synced_at)
VALUES
  ('rdm-digital-os','MDD_TAMV','LTOS_FUSION','{"role":"Kernel territorial + Civilizational Core","pages":38,"edge":3,"migrations":5}','ltos-001',NULL,'rdm-smart-city-os','active',now()),
  ('rdm-smart-city-os','MDD_TAMV','LTOS_FUSION','{"role":"Smart City OS con Civilizational Core","pages":33,"edge":1,"migrations":4}','ltos-002','rdm-digital-os','realdelmonte-digital-kernel','active',now()),
  ('realdelmonte-digital-kernel','DEKATEOTL','LTOS_FUSION','{"role":"Kernel TAMV con IPFS + Stripe","pages":40,"edge":4,"migrations":4}','ltos-003','rdm-smart-city-os','rdm-turismodigital','active',now()),
  ('rdm-turismodigital','BOOKPI','LTOS_FUSION','{"role":"Backend turistico federado","pages":9,"edge":14,"migrations":4}','ltos-004','realdelmonte-digital-kernel','real-del-monte-digital','active',now()),
  ('real-del-monte-digital','PHOENIX','LTOS_FUSION','{"role":"TAMV v1.0 produccion","pages":23,"edge":9,"migrations":6}','ltos-005','rdm-turismodigital','real-del-monte-twin','active',now()),
  ('real-del-monte-twin','KAOS','LTOS_FUSION','{"role":"Digital Twin territorial","pages":14,"edge":2,"migrations":8}','ltos-006','real-del-monte-digital','real-del-monte-atlas','active',now()),
  ('real-del-monte-atlas','MDD_TAMV','LTOS_FUSION','{"role":"Atlas TanStack Start","pages":0,"edge":0,"migrations":0}','ltos-007','real-del-monte-twin','real-del-monte-elevated','active',now()),
  ('real-del-monte-elevated','PHOENIX','LTOS_FUSION','{"role":"Frontend premium","pages":13,"edge":1,"migrations":3}','ltos-008','real-del-monte-atlas','rdm-digital-2026','active',now()),
  ('rdm-digital-2026','BOOKPI','LTOS_FUSION','{"role":"Enciclopedia civilizatoria","pages":41,"edge":2,"migrations":1}','ltos-009','real-del-monte-elevated','citemesh-roots','active',now()),
  ('citemesh-roots','CHRONOS','LTOS_FUSION','{"role":"Nucleo Operativo Autopoietico","pages":41,"edge":2,"migrations":0}','ltos-010','rdm-digital-2026','civilizational-core','active',now()),
  ('civilizational-core','ANUBIS','LTOS_FUSION','{"role":"Heptafederacion cognitiva","pages":30,"edge":6,"migrations":6}','ltos-011','citemesh-roots','rdm-digital-nodo-cero','active',now()),
  ('rdm-digital-nodo-cero','ANUBIS','LTOS_FUSION','{"role":"Manifiesto raiz Nodo Cero","pages":0,"edge":0,"migrations":0}','ltos-012','civilizational-core','rdm-digital-os','active',now())
ON CONFLICT (source_repo) DO UPDATE SET
  federation = EXCLUDED.federation,
  stream_type = EXCLUDED.stream_type,
  payload = EXCLUDED.payload,
  integrity_hash = EXCLUDED.integrity_hash,
  upstream_repo = EXCLUDED.upstream_repo,
  downstream_repo = EXCLUDED.downstream_repo,
  sync_status = 'active',
  last_synced_at = now();