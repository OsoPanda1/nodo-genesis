// ==================================================================
// Scripts/GameCore/ZombieVisualApplier.cs
// ------------------------------------------------------------------
// Aplica el perfil visual sobre los renderers del prefab usando
// MaterialPropertyBlock: evita clonar materiales por enemigo, algo
// crítico en WebGL con oleadas numerosas.
// ==================================================================

using UnityEngine;
using UnityEngine.Rendering;

namespace RDM.YUN.GameCore
{
    public static class ZombieVisualApplier
    {
        private static readonly int BaseColor = Shader.PropertyToID("_BaseColor");
        private static readonly int Color = Shader.PropertyToID("_Color");
        private static readonly int EmissionColor = Shader.PropertyToID("_EmissionColor");
        private static readonly int Metallic = Shader.PropertyToID("_Metallic");
        private static readonly int Smoothness = Shader.PropertyToID("_Smoothness");

        public static void Apply(GameObject zombie, ZombieVisualProfile profile)
        {
            zombie.transform.localScale = Vector3.one * profile.transform.scale;

            if (!ColorUtility.TryParseHtmlString(profile.material.baseColor, out var baseColor))
            {
                baseColor = Color.white;
            }

            var hasEmission = ColorUtility.TryParseHtmlString(
                profile.material.emissionColor,
                out var emissionColor
            );

            foreach (var renderer in zombie.GetComponentsInChildren<Renderer>(true))
            {
                renderer.shadowCastingMode = profile.render.castShadows
                    ? ShadowCastingMode.On
                    : ShadowCastingMode.Off;

                renderer.receiveShadows = profile.render.receiveShadows;

                var block = new MaterialPropertyBlock();
                renderer.GetPropertyBlock(block);

                block.SetColor(BaseColor, baseColor);
                block.SetColor(Color, baseColor);
                block.SetFloat(Metallic, profile.material.metallic);
                block.SetFloat(Smoothness, profile.material.smoothness);

                if (hasEmission && profile.material.emissionIntensity > 0f)
                {
                    block.SetColor(
                        EmissionColor,
                        emissionColor * profile.material.emissionIntensity
                    );
                }

                renderer.SetPropertyBlock(block);
            }
        }
    }
}
