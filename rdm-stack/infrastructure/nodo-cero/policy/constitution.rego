# ==================================================================
# CONSTITUTION YUN — Política de operación del Quantum Semantic Core
# ==================================================================
# Espejo del blueprint `constitution.rego` (OPA). En el Nodo Cero la
# equivalencia de negocio se evalúa en lib/yun/policy.ts; este archivo
# es la fuente declarativa para OPA/Gatekeeper y despliegues k8s.
# ==================================================================

package yun.constitution

# El sellado híbrido exige un proveedor criptográfico auditado.
default seal_allowed = false

seal_allowed {
    input.provider_available == true
}

# Verificación con regla AND: clásica AND post-cuántica.
default verify_allowed = false

verify_allowed {
    input.classical_ok == true
    input.post_quantum_ok == true
    input.policy_ok == true
    input.hash_ok == true
}

# El contenedor debe ejecutar como usuario no root (PSP).
allow_run_as_non_root {
    input.run_as_non_root == true
}

# El readinessProbe debe usar el endpoint de prontitud operativa.
allow_readiness_probe {
    input.readiness_probe == "/api/yun/ready"
}

# Sensibilidades altas exigen sellado híbrido.
allow_critical_sealed {
    input.sensitivity in {"restricted", "critical"}
    input.sealed == true
}

# Los eventos de federaciones no deben referir una federación concreta.
deny_federation_domain_leak {
    input.domain == "federations"
    input.federation_id != null
}
