// ==================================================================
// Scripts/Zombies/ZombieConfig.cs
// ------------------------------------------------------------------
// ScriptableObject para tunear el comportamiento de cada arquetipo
// sin tocar código (inspirado en el patrón Component de Unity).
// ==================================================================

using UnityEngine;

namespace RDM.YUN.Zombies
{
    [CreateAssetMenu(fileName = "ZombieConfig", menuName = "RDM/Zombies/Zombie Config")]
    public sealed class ZombieConfig : ScriptableObject
    {
        [Header("Identity")]
        public string archetypeId = "z-caminero";
        public string displayName = "Caminero del Socavón";
        public Rarity rarity = Rarity.Comun;

        [Header("Combat")]
        public int maxHealth = 60;
        public int basePoints = 100;
        public int contactDamage = 10;
        public float attackCooldown = 1.2f;
        public float attackRange = 1.6f;

        [Header("Movement")]
        public float moveSpeed = 2.5f;
        public float chaseSpeed = 4f;
        public float detectionRange = 18f;
        public float loseRange = 32f;
        public float evasion = 0.15f;

        [Header("Territorio")]
        public SpawnZone[] zones;
        public bool onlyAtNight;
        public bool onlyInFog;

        public enum Rarity { Comun, Raro, Epico }
        public enum SpawnZone { Mina, Cultura, Naturaleza, Gastronomia, Calles }
    }
}
