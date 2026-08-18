// ==================================================================
// Scripts/GameCore/PlayerController.cs
// ------------------------------------------------------------------
// Controlador FPS del guardián. Aísla el movimiento real del jugador;
// el AntiCheat.MovementValidator vigila que nadie supere las
// velocidades físicas del territorio.
// ==================================================================

using UnityEngine;

namespace RDM.YUN.GameCore
{
    [RequireComponent(typeof(CharacterController))]
    public sealed class PlayerController : MonoBehaviour
    {
        [Header("Movement")]
        [SerializeField] private float walkSpeed = 6f;
        [SerializeField] private float runSpeed = 9f;
        [SerializeField] private float jumpHeight = 1.2f;
        [SerializeField] private float gravity = -20f;

        [Header("Mouse look")]
        [SerializeField] private float lookSensitivity = 2f;
        [SerializeField] private Transform cameraTransform;

        private CharacterController controller;
        private Vector3 velocity;
        private float pitch;

        public bool IsRunning { get; private set; }

        private void Awake()
        {
            controller = GetComponent<CharacterController>();
            if (cameraTransform == null) cameraTransform = Camera.main?.transform;
        }

        private void Update()
        {
            if (Time.timeScale == 0f) return;

            HandleLook();
            HandleMove();

            // Gravedad
            if (controller.isGrounded && velocity.y < 0f) velocity.y = -2f;
            velocity.y += gravity * Time.deltaTime;
            controller.Move(velocity * Time.deltaTime);
        }

        private void HandleLook()
        {
            float mouseX = Input.GetAxis("Mouse X") * lookSensitivity;
            float mouseY = Input.GetAxis("Mouse Y") * lookSensitivity;

            pitch = Mathf.Clamp(pitch - mouseY, -89f, 89f);
            transform.Rotate(Vector3.up * mouseX);
            if (cameraTransform != null) cameraTransform.localRotation = Quaternion.Euler(pitch, 0f, 0f);
        }

        private void HandleMove()
        {
            IsRunning = Input.GetKey(KeyCode.LeftShift);
            float speed = IsRunning ? runSpeed : walkSpeed;

            float h = Input.GetAxis("Horizontal");
            float v = Input.GetAxis("Vertical");

            Vector3 move = transform.right * h + transform.forward * v;
            if (move.magnitude > 1f) move.Normalize();

            controller.Move(move * speed * Time.deltaTime);

            if (Input.GetButtonDown("Jump") && controller.isGrounded)
            {
                velocity.y = Mathf.Sqrt(jumpHeight * -2f * gravity);
            }
        }
    }
}
