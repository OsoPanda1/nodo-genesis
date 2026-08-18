// ==================================================================
// Scripts/AntiCheat/MovementValidator.cs
// ------------------------------------------------------------------
// Detecta movimiento imposible (teleport / speed hack) comparando la
// distancia entre frames contra un límite físico. La protección REAL
// vive en el servidor; esto solo añade una capa defensiva temprana.
// ==================================================================

using UnityEngine;

namespace RDM.YUN.AntiCheat
{
    public sealed class MovementValidator : MonoBehaviour
    {
        [SerializeField] private float maxSpeed = 10f;

        private Vector3 lastPosition;
        private float lastTime;

        private void Start()
        {
            lastPosition = transform.position;
            lastTime = Time.time;
        }

        private void Update()
        {
            float dt = Time.time - lastTime;
            if (dt <= 0f) return;

            float distance = Vector3.Distance(transform.position, lastPosition);
            float speed = distance / dt;

            if (speed > maxSpeed * 2f)
            {
                Debug.LogWarning("[RDM-ANTICHEAT] Movimiento anómalo detectado (posible teleport/speed hack).");
                // Opcional: notificar al backend con un evento 'suspicious'.
                // ScoreClient podría exponer ReportSuspicious() para ello.
            }

            lastPosition = transform.position;
            lastTime = Time.time;
        }
    }
}
