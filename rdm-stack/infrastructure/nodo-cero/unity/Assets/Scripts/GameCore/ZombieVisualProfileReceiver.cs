// ==================================================================
// Scripts/GameCore/ZombieVisualProfileReceiver.cs
// ------------------------------------------------------------------
// Receptor de perfiles visuales de zombie (cosmético). Recibe el JSON
// validado por el backend YUN y lo registra en la ZombieFactory.
// NO controla salud, daño, puntuación ni ciclo de vida: eso lo sigue
// gobernando el gameplay server-authoritative.
// ==================================================================

using System;
using System.Collections.Generic;
using UnityEngine;

namespace RDM.YUN.GameCore
{
    [Serializable]
    public class ZombieMaterialProfile
    {
        public string baseColor;
        public string emissionColor;
        public float emissionIntensity;
        public float metallic;
        public float smoothness;
        public float hueShift;
    }

    [Serializable]
    public class ZombieRotationProfile
    {
        public float x;
        public float y;
        public float z;
    }

    [Serializable]
    public class ZombieTransformProfile
    {
        public float scale;
        public ZombieRotationProfile rotationDegrees;
    }

    [Serializable]
    public class ZombieRenderProfile
    {
        public bool castShadows;
        public bool receiveShadows;
        public float lodBias;
    }

    [Serializable]
    public class ZombieVisualProfile
    {
        public string version;
        public string profileId;
        public string archetype;
        public int seed;
        public ZombieMaterialProfile material;
        public ZombieTransformProfile transform;
        public ZombieRenderProfile render;
    }

    public sealed class ZombieVisualProfileReceiver : MonoBehaviour
    {
        [SerializeField] private ZombieFactory zombieFactory;

        private readonly Dictionary<string, ZombieVisualProfile> profiles =
            new Dictionary<string, ZombieVisualProfile>();

        public void ApplyZombieVisualProfile(string rawJson)
        {
            if (string.IsNullOrWhiteSpace(rawJson))
            {
                Debug.LogWarning("[RDM] Perfil visual vacío.");
                return;
            }

            try
            {
                var profile = JsonUtility.FromJson<ZombieVisualProfile>(rawJson);

                if (!IsValid(profile))
                {
                    Debug.LogWarning("[RDM] Perfil visual rechazado.");
                    return;
                }

                profiles[profile.profileId] = profile;
                zombieFactory.RegisterVisualProfile(profile);
            }
            catch (Exception exception)
            {
                Debug.LogWarning($"[RDM] Perfil visual inválido: {exception.Message}");
            }
        }

        private static bool IsValid(ZombieVisualProfile profile)
        {
            if (profile == null || profile.version != "1.0")
            {
                return false;
            }

            if (string.IsNullOrWhiteSpace(profile.profileId) ||
                string.IsNullOrWhiteSpace(profile.archetype) ||
                profile.material == null ||
                profile.transform == null ||
                profile.transform.rotationDegrees == null ||
                profile.render == null)
            {
                return false;
            }

            return profile.transform.scale >= 0.5f &&
                   profile.transform.scale <= 3f &&
                   profile.material.metallic >= 0f &&
                   profile.material.metallic <= 1f &&
                   profile.material.smoothness >= 0f &&
                   profile.material.smoothness <= 1f &&
                   profile.material.emissionIntensity >= 0f &&
                   profile.material.emissionIntensity <= 8f;
        }
    }
}
