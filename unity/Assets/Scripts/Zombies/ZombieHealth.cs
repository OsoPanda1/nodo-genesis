// ==================================================================
// Scripts/Zombies/ZombieHealth.cs
// ------------------------------------------------------------------
// Salud del zombie. Al morir notifica a GameManager (evento kill),
// a WaveManager (contador) y reporta el evento al backend YUN.
// ==================================================================

using System;
using UnityEngine;

namespace RDM.YUN.Zombies
{
    public sealed class ZombieHealth : MonoBehaviour
    {
        [SerializeField] private ZombieConfig config;

        public event Action OnZombieDied;

        public int Health { get; private set; }
        public ZombieConfig Config => config;

        private void Awake()
        {
            Health = config != null ? config.maxHealth : 60;
        }

        public void Configure(ZombieConfig cfg)
        {
            config = cfg;
            Health = cfg.maxHealth;
        }

        public void TakeDamage(int amount, Vector3 hitPoint)
        {
            if (Health <= 0) return;
            Health = Mathf.Clamp(Health - amount, 0, Health);

            if (Health <= 0) Die();
        }

        private void Die()
        {
            OnZombieDied?.Invoke();

            GetComponent<ZombieAI>()?.OnDefeated();
            var wave = FindObjectOfType<GameCore.WaveManager>();
            if (wave != null) wave.RegisterZombieDeath();

            // Evento server-authoritative: el cliente solo reporta, el
            // backend decide cuántos puntos vale (anti-cheat + reglas).
            if (config != null)
            {
                GameCore.GameManager.Instance.OnZombieKilled(
                    config.archetypeId,
                    config.basePoints,
                    Vector3.Distance(transform.position, Camera.main?.transform.position ?? Vector3.zero));
            }

            // Pooling opcional; aquí destruimos por simplicidad.
            Destroy(gameObject, 2f);
        }
    }
}
