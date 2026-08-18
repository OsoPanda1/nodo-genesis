// ==================================================================
// Scripts/GameCore/CameraController.cs
// ------------------------------------------------------------------
// Cámara del guardián en primera persona. Usa la cámara principal.
// ==================================================================

using UnityEngine;

namespace RDM.YUN.GameCore
{
    public sealed class CameraController : MonoBehaviour
    {
        [SerializeField] private Transform target;
        [SerializeField] private float offsetY = 1.7f;
        [SerializeField] private float smoothTime = 0.1f;

        private Vector3 velocity;

        private void Awake()
        {
            if (target == null)
            {
                var player = FindObjectOfType<PlayerController>();
                if (player != null) target = player.transform;
            }
        }

        private void LateUpdate()
        {
            if (target == null) return;
            Vector3 desired = new Vector3(target.position.x, target.position.y + offsetY, target.position.z);
            transform.position = Vector3.SmoothDamp(transform.position, desired, ref velocity, smoothTime);
        }
    }
}
