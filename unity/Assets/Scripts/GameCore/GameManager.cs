// ==================================================================
// ZOMBIES RDM INVASION — Unity client (reference implementation)
// Scripts/GameCore/GameManager.cs
// ------------------------------------------------------------------
// Orquesta el estado de la partida (inicio, oleadas, pausa, fin) y
// delega TODO reporte de puntuación al ScoreClient. El cliente nunca
// calcula puntos finales: solo emite eventos firmados al backend YUN
// (server-authoritative).
// ==================================================================

using UnityEngine;

namespace RDM.YUN.GameCore
{
    public sealed class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        public int currentWave { get; private set; }
        public bool isGameOver { get; private set; }
        public int comboCount { get; private set; }

        [SerializeField] private WaveManager waveManager;
        [SerializeField] private ScoreClient scoreClient;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Start()
        {
            waveManager = FindObjectOfType<WaveManager>();
            scoreClient = FindObjectOfType<ScoreClient>();
            comboCount = 0;
            StartCoroutine(scoreClient.StartSessionCoroutine(OnSessionStarted));
        }

        private void OnSessionStarted(bool ok, string error)
        {
            if (ok)
            {
                Debug.Log("[RDM-GAME] Sesión YUN iniciada.");
                var bridge = WebGLBridge.Instance;
                if (bridge != null && scoreClient != null) bridge.NotifySessionStarted(scoreClient.SessionId);
                waveManager.BeginNextWave();
            }
            else
            {
                Debug.LogWarning($"[RDM-GAME] Sesión YUN falló ({error}); jugando en modo simulación local.");
                waveManager.BeginNextWave();
            }
        }

        public void OnZombieKilled(string archetypeId, int basePoints, float distance)
        {
            if (isGameOver) return;

            comboCount = Mathf.Clamp(comboCount + 1, 0, 500);
            scoreClient.ReportZombieKill(archetypeId, basePoints, distance, comboCount);

            if (comboCount >= 2)
            {
                scoreClient.ReportCombo(comboCount);
            }
        }

        public void OnWaveCompleted()
        {
            currentWave++;
            comboCount = 0;
            scoreClient.ReportWaveCompleted(currentWave);
            WebGLBridge.Instance?.NotifyWave(currentWave);
        }

        public void OnMissionCompleted(string missionId, int reward)
        {
            scoreClient.ReportMissionCompleted(missionId, reward);
        }

        public void OnPrizeRedeemed(string prizeId, int cost)
        {
            scoreClient.ReportPrizeRedeemed(prizeId, cost);
        }

        public void GameOver()
        {
            isGameOver = true;
            scoreClient.EndSession();
            WebGLBridge.Instance?.NotifyGameOver(0, currentWave);
            Time.timeScale = 1f;
        }
    }
}
