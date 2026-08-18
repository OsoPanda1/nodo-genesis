// ==================================================================
// Scripts/GameCore/WaveManager.cs
// ------------------------------------------------------------------
// Controla las oleadas de zombies (cantidad, pausas, dificultad) y
// notifica a GameManager cuando una oleada se completa.
// ==================================================================

using System.Collections;
using UnityEngine;

namespace RDM.YUN.GameCore
{
    public sealed class WaveManager : MonoBehaviour
    {
        [Header("Wave tuning")]
        [SerializeField] private int baseZombiesPerWave = 5;
        [SerializeField] private float waveIntervalSeconds = 3f;
        [SerializeField] private int maxWave = 50;

        private Zombies.ZombieSpawner spawner;
        private int remainingAlive;
        private bool waveActive;
        private int currentWave;

        public int CurrentWave => currentWave;

        private void Awake()
        {
            spawner = FindObjectOfType<Zombies.ZombieSpawner>();
        }

        public void BeginNextWave()
        {
            if (currentWave >= maxWave) return;
            currentWave++;
            StartCoroutine(RunWave(currentWave));
        }

        private IEnumerator RunWave(int waveNumber)
        {
            yield return new WaitForSeconds(waveIntervalSeconds);

            int zombiesToSpawn = baseZombiesPerWave + (waveNumber * 2);
            spawner.SpawnWave(zombiesToSpawn, waveNumber);
            remainingAlive = zombiesToSpawn;
            waveActive = true;

            while (waveActive && remainingAlive > 0)
            {
                yield return new WaitForSeconds(0.5f);
            }

            if (waveActive)
            {
                waveActive = false;
                GameManager.Instance.OnWaveCompleted();
            }
        }

        public void RegisterZombieDeath()
        {
            if (!waveActive) return;
            remainingAlive = Mathf.Max(0, remainingAlive - 1);
        }
    }
}
