// ==================================================================
// Scripts/GameCore/Projectile.cs
// ------------------------------------------------------------------
// Proyectil del guardián. Aplica daño al ZombieHealth que impacta.
// ==================================================================

using UnityEngine;

namespace RDM.YUN.GameCore
{
    [RequireComponent(typeof(Rigidbody))]
    public sealed class Projectile : MonoBehaviour
    {
        [SerializeField] private float speed = 30f;
        [SerializeField] private float lifetime = 3f;
        [SerializeField] private float radius = 0.5f;

        private int damage;
        private Rigidbody rb;

        private void Awake()
        {
            rb = GetComponent<Rigidbody>();
        }

        public void Launch(Vector3 direction, int damageValue)
        {
            damage = damageValue;
            rb.linearVelocity = direction.normalized * speed;
            Destroy(gameObject, lifetime);
        }

        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Zombie"))
            {
                other.GetComponent<Zombies.ZombieHealth>()?.TakeDamage(damage, transform.position);
                Destroy(gameObject);
            }
        }

        private void OnDrawGizmosSelected()
        {
            Gizmos.color = Color.yellow;
            Gizmos.DrawWireSphere(transform.position, radius);
        }
    }
}
