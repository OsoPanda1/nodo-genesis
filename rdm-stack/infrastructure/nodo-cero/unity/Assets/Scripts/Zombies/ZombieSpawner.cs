// ==================================================================
// Scripts/Zombies/ZombieSpawner.cs
// ------------------------------------------------------------------
// Genera oleadas de zombies alrededor del jugador (en el territorio)
// y aplica el ZombieConfig por arquetipo.
// ==================================================================

using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace RDM.YUN.Zombies
{
    public sealed class ZombieSpawner : MonoBehaviour
    {
        [SerializeField] private GameObject zombiePrefab;
        [SerializeField] private ZombieConfig[] availableConfigs;
        [SerializeField] private float spawnRadius = 12f;
        [SerializeField] private float spawnInterval = 0.4f;

        private Transform player;

        private void Awake()
        {
            player = GameObject.FindGameObjectWithTag("Player")?.transform;
        }

        public void ConfigurePrefab(GameObject prefab)
        {
            zombiePrefab = prefab;
        }

        public void SpawnWave(int count, int waveNumber)
        {
            StartCoroutine(SpawnWaveCoroutine(count, waveNumber));
        }

        private IEnumerator SpawnWaveCoroutine(int count, int waveNumber)
        {
            for (int i = 0; i < count; i++)
            {
                SpawnOne(waveNumber);
                yield return new WaitForSeconds(spawnInterval);
            }
        }

        private void SpawnOne(int waveNumber)
        {
            if (zombiePrefab == null || availableConfigs == null || availableConfigs.Length == 0) return;

            Vector3 origin = player != null ? player.position : transform.position;
            Vector2 offset = Random.insideUnitCircle * spawnRadius;
            Vector3 position = new Vector3(origin.x + offset.x, origin.y, origin.z + offset.y);

            ZombieConfig config = availableConfigs[Random.Range(0, availableConfigs.Length)];
            var go = Instantiate(zombiePrefab, position, Quaternion.identity);
            go.GetComponent<ZombieHealth>()?.Configure(config);
            go.GetComponent<ZombieAI>()?.Configure(config);
        }
    }
}
