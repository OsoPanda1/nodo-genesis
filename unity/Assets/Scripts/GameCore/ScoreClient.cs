// ==================================================================
// Scripts/GameCore/ScoreClient.cs
// ------------------------------------------------------------------
// Puente seguro con el backend YUN (lib/gamification). Envía eventos
// firmados con el token de sesión; NUNCA decide puntos finales. Cada
// evento incluye sessionId + timestamp para que el anti-cheat del
// servidor valide coherencia antes de otorgar puntos.
// ==================================================================

using System;
using System.Collections;
using UnityEngine;

namespace RDM.YUN.GameCore
{
    public sealed class ScoreClient : MonoBehaviour
    {
        private Networking.AuthClient authClient;
        private Networking.SecureApiClient apiClient;

        public string SessionId { get; private set; }
        public bool HasSession => !string.IsNullOrEmpty(SessionId);

        private void Awake()
        {
            apiClient = new Networking.SecureApiClient();
            authClient = new Networking.AuthClient();
        }

        public IEnumerator StartSessionCoroutine(Action<bool, string> onDone)
        {
            var deviceId = SystemInfo.deviceUniqueIdentifier;
            yield return apiClient.PostJson<SessionStartDto>(
                "/api/gamification/session",
                new { action = "start", deviceId },
                dto =>
                {
                    SessionId = dto.sessionId;
                    authClient.SetSession(dto.sessionId, dto.token);
                    onDone?.Invoke(true, null);
                },
                error => onDone?.Invoke(false, error));
        }

        public void EndSession()
        {
            if (!HasSession) return;
            StartCoroutine(apiClient.PostJson<object>(
                "/api/gamification/session",
                new { action = "end", sessionId = SessionId },
                _ => authClient.ClearSession(),
                _ => authClient.ClearSession()));
        }

        public void ReportZombieKill(string archetypeId, int basePoints, float distance, int comboCount)
        {
            if (!HasSession) return;
            StartCoroutine(apiClient.PostJson<EventResultDto>(
                "/api/gamification/events",
                new
                {
                    type = "kill-zombie",
                    sessionId = SessionId,
                    token = authClient.Token,
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    archetypeId,
                    basePoints,
                    comboCount,
                },
                dto =>
                {
                    if (dto.ok && !dto.accepted)
                    {
                        Debug.LogWarning($"[RDM-GAME] Evento rechazado por anti-cheat: {dto.reason}");
                    }
                },
                _ => { }));
        }

        public void ReportWaveCompleted(int waveNumber)
        {
            if (!HasSession) return;
            StartCoroutine(apiClient.PostJson<EventResultDto>(
                "/api/gamification/events",
                new
                {
                    type = "wave-completed",
                    sessionId = SessionId,
                    token = authClient.Token,
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    waveNumber,
                },
                _ => { }, _ => { }));
        }

        public void ReportCombo(int comboCount)
        {
            if (!HasSession || comboCount < 2) return;
            StartCoroutine(apiClient.PostJson<EventResultDto>(
                "/api/gamification/events",
                new
                {
                    type = "combo",
                    sessionId = SessionId,
                    token = authClient.Token,
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    comboCount,
                },
                _ => { }, _ => { }));
        }

        public void ReportMissionCompleted(string missionId, int reward)
        {
            if (!HasSession) return;
            StartCoroutine(apiClient.PostJson<EventResultDto>(
                "/api/gamification/events",
                new
                {
                    type = "mission-completed",
                    sessionId = SessionId,
                    token = authClient.Token,
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    missionId,
                    reward,
                },
                _ => { }, _ => { }));
        }

        public void ReportPrizeRedeemed(string prizeId, int cost)
        {
            if (!HasSession) return;
            StartCoroutine(apiClient.PostJson<EventResultDto>(
                "/api/gamification/events",
                new
                {
                    type = "prize-redeemed",
                    sessionId = SessionId,
                    token = authClient.Token,
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    prizeId,
                    cost,
                },
                _ => { }, _ => { }));
        }

        [Serializable]
        public class SessionStartDto
        {
            public bool ok;
            public string sessionId;
            public string token;
            public string actorId;
        }

        [Serializable]
        public class EventResultDto
        {
            public bool ok;
            public bool accepted;
            public int pointsAwarded;
            public int totalPoints;
            public string reason;
        }
    }
}
