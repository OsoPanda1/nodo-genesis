// ==================================================================
// Scripts/AntiCheat/SessionGuard.cs
// ------------------------------------------------------------------
// Evita sesiones simultáneas con el mismo perfil: al iniciar, verifica
// con el backend si ya existe una sesión activa para el deviceId y la
// reutiliza (el servidor también aplica este control).
// ==================================================================

using System.Collections;
using UnityEngine;

namespace RDM.YUN.AntiCheat
{
    public sealed class SessionGuard : MonoBehaviour
    {
        [SerializeField] private GameCore.ScoreClient scoreClient;

        private void Awake()
        {
            scoreClient = FindObjectOfType<GameCore.ScoreClient>();
        }

        public IEnumerator ValidateSingleSession(System.Action<bool> onResult)
        {
            if (scoreClient == null)
            {
                onResult?.Invoke(false);
                yield break;
            }

            yield return scoreClient.StartSessionCoroutine((ok, error) =>
            {
                onResult?.Invoke(ok);
            });
        }

        private void OnApplicationPause(bool paused)
        {
            // Al pausar la app no cerramos la sesión (el servidor tiene
            // TTL). Al volver, reutilizamos la sesión persistida.
        }
    }
}
