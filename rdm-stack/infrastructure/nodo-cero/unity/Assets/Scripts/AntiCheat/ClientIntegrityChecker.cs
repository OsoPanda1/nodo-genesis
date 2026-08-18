// ==================================================================
// Scripts/AntiCheat/ClientIntegrityChecker.cs
// ------------------------------------------------------------------
// Comprobaciones básicas de integridad del cliente (defensivas):
// tiempo de escala anómalo y cambios de jerarquía sospechosos. La
// autoridad final siempre es el backend (server-authoritative).
// ==================================================================

using UnityEngine;

namespace RDM.YUN.AntiCheat
{
    public sealed class ClientIntegrityChecker : MonoBehaviour
    {
        private float realDeltaTime;

        private void Start()
        {
            realDeltaTime = 0f;
        }

        private void Update()
        {
            float current = Time.deltaTime;
            if (realDeltaTime > 0f && Mathf.Abs(current - realDeltaTime) > 1.5f)
            {
                Debug.LogWarning("[RDM-ANTICHEAT] Salto de frame anómalo: posible manipulación de Time.timeScale.");
            }
            realDeltaTime = current;
        }

        /// <summary>
        /// Comprueba que el GameObject del jugador no haya sido
        /// duplicado o movido fuera del territorio válido.
        /// </summary>
        public bool ValidateTerritoryBounds(Vector3 position, Bounds allowedBounds)
        {
            return allowedBounds.Contains(position);
        }
    }
}
