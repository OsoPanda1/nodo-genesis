// ==================================================================
// Scripts/GameCore/RDMArenaBootstrap.cs
// ------------------------------------------------------------------
// Bootstrap de la escena RDMArena. Asegura que la jerarquía mínima
// del juego exista (AuthClient, ScoreClient, GameManager, WaveManager,
// ZombieSpawner, Player, cámara, suelo) cuando se abre en el Editor o
// en un build, de modo que el proyecto funcione sin ensamblado manual.
// Los objetos marcados como `keep` (ya presentes) no se duplican.
// ==================================================================

using UnityEngine;

namespace RDM.YUN.GameCore
{
    public sealed class RDMArenaBootstrap : MonoBehaviour
    {
        private static class Tags
        {
            public const string Player = "Player";
        }

        [SerializeField] private bool runOnAwake = true;
        [SerializeField] private GameObject zombiePrefab;

        private void Awake()
        {
            if (runOnAwake) EnsureArena();
        }

        // ------------------------------------------------------------
        // Construcción de la arena
        // ------------------------------------------------------------

        public void EnsureArena()
        {
            EnsureAuthAndScore();
            EnsureGameManager();
            EnsureWaveManager();
            EnsurePlayer();
            EnsureFloor();
            EnsureWebGLBridge();
        }

        private void EnsureAuthAndScore()
        {
            if (FindObjectOfType<Networking.AuthClient>() == null)
            {
                var go = new GameObject("AuthClient");
                go.transform.SetParent(transform);
                go.AddComponent<Networking.AuthClient>();
            }

            if (FindObjectOfType<ScoreClient>() == null)
            {
                var go = new GameObject("ScoreClient");
                go.transform.SetParent(transform);
                go.AddComponent<ScoreClient>();
            }
        }

        private void EnsureGameManager()
        {
            if (FindObjectOfType<GameManager>() == null)
            {
                var go = new GameObject("GameManager");
                go.transform.SetParent(transform);
                go.AddComponent<GameManager>();
            }
        }

        private void EnsureWaveManager()
        {
            if (FindObjectOfType<WaveManager>() == null)
            {
                var go = new GameObject("WaveManager");
                go.transform.SetParent(transform);
                go.AddComponent<WaveManager>();
            }
        }

        private void EnsurePlayer()
        {
            var existing = FindObjectOfType<PlayerController>();
            if (existing != null) return;

            var player = new GameObject("Player");
            player.tag = Tags.Player;
            player.transform.position = new Vector3(0f, 0.5f, 0f);

            var controller = player.AddComponent<CharacterController>();
            controller.height = 1.8f;
            controller.radius = 0.4f;
            player.AddComponent<PlayerController>();
            player.AddComponent<PlayerHealth>();

            var camera = Camera.main;
            if (camera != null)
            {
                camera.transform.SetParent(player.transform);
                camera.transform.localPosition = new Vector3(0f, 1.6f, 0f);
            }
        }

        private void EnsureFloor()
        {
            var floor = GameObject.CreatePrimitive(PrimitiveType.Cube);
            floor.name = "Arena Floor";
            floor.transform.position = new Vector3(0f, -0.25f, 0f);
            floor.transform.localScale = new Vector3(40f, 0.5f, 40f);
            var renderer = floor.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material.color = new Color(0.08f, 0.1f, 0.13f);
            }
        }

        private void EnsureWebGLBridge()
        {
            if (FindObjectOfType<WebGLBridge>() == null)
            {
                gameObject.AddComponent<WebGLBridge>();
            }
        }

        public void ConfigureZombiePrefab(GameObject prefab)
        {
            zombiePrefab = prefab;
            var spawner = FindObjectOfType<Zombies.ZombieSpawner>();
            if (spawner != null) spawner.ConfigurePrefab(prefab);
        }
    }
}
