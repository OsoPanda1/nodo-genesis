// ==================================================================
// Scripts/GameCore/PlayerHealth.cs
// ------------------------------------------------------------------
// Salud del guardián, daño, invulnerabilidad breve y Game Over.
// ==================================================================

using System;
using UnityEngine;

namespace RDM.YUN.GameCore
{
    public sealed class PlayerHealth : MonoBehaviour
    {
        [SerializeField] private int maxHealth = 100;
        [SerializeField] private float invulnerabilitySeconds = 1f;

        public event Action<int> OnHealthChanged;
        public event Action OnPlayerDied;

        public int Health { get; private set; }
        public int MaxHealth => maxHealth;

        private float lastHitTime = -999f;

        private void Awake()
        {
            Health = maxHealth;
        }

        public void TakeDamage(int amount)
        {
            if (amount <= 0) return;
            if (Time.time - lastHitTime < invulnerabilitySeconds) return;

            lastHitTime = Time.time;
            Health = Mathf.Clamp(Health - amount, 0, maxHealth);
            OnHealthChanged?.Invoke(Health);

            if (Health <= 0)
            {
                OnPlayerDied?.Invoke();
                GameManager.Instance.GameOver();
            }
        }

        public void Heal(int amount)
        {
            Health = Mathf.Clamp(Health + amount, 0, maxHealth);
            OnHealthChanged?.Invoke(Health);
        }
    }
}
