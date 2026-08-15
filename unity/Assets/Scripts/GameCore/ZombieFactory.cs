// ==================================================================
// Scripts/GameCore/ZombieFactory.cs
// ------------------------------------------------------------------
// Fábrica de zombies con allowlist cerrada de prefabs. Aplica el
// perfil visual registrado y prueba la posición sobre el NavMesh
// antes de instanciar. Unity conserva la autoridad sobre prefabs,
// NavMesh, Animator, daño, oleadas y ciclo de vida.
// ==================================================================

using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AI;

namespace RDM.YUN.GameCore
{
    public sealed class ZombieFactory : MonoBehaviour
    {
        [Header("Allowlist de prefabs")]
        [SerializeField] private GameObject walkerPrefab;
        [SerializeField] private GameObject runnerPrefab;
        [SerializeField] private GameObject brutePrefab;
        [SerializeField] private GameObject minerPrefab;
        [SerializeField] private GameObject spectralPrefab;
        [SerializeField] private GameObject bossPrefab;

        private readonly Dictionary<string, ZombieVisualProfile> profiles =
            new Dictionary<string, ZombieVisualProfile>();

        public void RegisterVisualProfile(ZombieVisualProfile profile)
        {
            profiles[profile.profileId] = profile;
        }

        public GameObject Spawn(
            string archetype,
            Vector3 position,
            string profileId
        )
        {
            if (!profiles.TryGetValue(profileId, out var profile))
            {
                Debug.LogWarning($"[RDM] Perfil no encontrado: {profileId}");
                return null;
            }

            if (profile.archetype != archetype)
            {
                Debug.LogWarning("[RDM] Archetype y perfil no coinciden.");
                return null;
            }

            var prefab = ResolvePrefab(archetype);

            if (prefab == null)
            {
                Debug.LogWarning($"[RDM] Archetype no permitido: {archetype}");
                return null;
            }

            if (NavMesh.SamplePosition(position, out var hit, 4f, NavMesh.AllAreas))
            {
                position = hit.position;
            }

            var zombie = Instantiate(
                prefab,
                position,
                Quaternion.Euler(
                    profile.transform.rotationDegrees.x,
                    profile.transform.rotationDegrees.y,
                    profile.transform.rotationDegrees.z
                )
            );

            ZombieVisualApplier.Apply(zombie, profile);
            return zombie;
        }

        private GameObject ResolvePrefab(string archetype)
        {
            switch (archetype)
            {
                case "walker": return walkerPrefab;
                case "runner": return runnerPrefab;
                case "brute": return brutePrefab;
                case "miner": return minerPrefab;
                case "spectral": return spectralPrefab;
                case "boss": return bossPrefab;
                default: return null;
            }
        }
    }
}
