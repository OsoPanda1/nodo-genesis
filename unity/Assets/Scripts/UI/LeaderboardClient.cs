// ==================================================================
// Scripts/UI/LeaderboardClient.cs
// ------------------------------------------------------------------
// Consulta y envío del ranking de guardianes al backend YUN.
// Solo muestra valores que el servidor devuelve.
// ==================================================================

using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace RDM.YUN.UI
{
    public sealed class LeaderboardClient : MonoBehaviour
    {
        [SerializeField] private Text contentText;
        [SerializeField] private InputField nameInput;

        private Networking.SecureApiClient apiClient;

        private void Awake()
        {
            apiClient = new Networking.SecureApiClient();
        }

        public void Refresh()
        {
            StartCoroutine(apiClient.GetJson<LeaderboardDto>(
                "/api/gamification/leaderboard?limit=10",
                dto => Render(dto),
                err => Debug.LogWarning($"[RDM-GAME] Leaderboard: {err}")));
        }

        public void Submit()
        {
            var score = FindObjectOfType<GameCore.ScoreClient>();
            if (score == null || !score.HasSession) return;

            string name = nameInput != null && !string.IsNullOrEmpty(nameInput.text) ? nameInput.text : "Guardián Anónimo";
            StartCoroutine(apiClient.PostJson<object>(
                "/api/gamification/leaderboard",
                new { sessionId = score.SessionId, token = Networking.AuthClient.Instance?.Token, name },
                _ => Refresh(),
                err => Debug.LogWarning($"[RDM-GAME] Submit: {err}")));
        }

        private void Render(LeaderboardDto dto)
        {
            if (contentText == null || dto.entries == null) return;

            string lines = "RANKING DE GUARDIANES\n";
            for (int i = 0; i < dto.entries.Count && i < 10; i++)
            {
                var e = dto.entries[i];
                lines += $"{i + 1}. {e.name} — {e.points} pts ({e.captures} capturas)\n";
            }
            contentText.text = lines;
        }

        [System.Serializable]
        public class LeaderboardDto
        {
            public bool ok;
            public System.Collections.Generic.List<EntryDto> entries;
        }

        [System.Serializable]
        public class EntryDto
        {
            public string name;
            public int points;
            public int captures;
        }
    }
}
