// ==================================================================
// Scripts/Networking/AuthClient.cs
// ------------------------------------------------------------------
// Gestiona el token de sesión del juego (emitido por el backend YUN
// con HMAC). El token se adjunta a cada evento para que el servidor
// valide integridad y caducidad (anti-cheat).
// ==================================================================

using UnityEngine;

namespace RDM.YUN.Networking
{
    public sealed class AuthClient : MonoBehaviour
    {
        public static AuthClient Instance { get; private set; }

        private const string TokenKey = "rdm.gamification.token";
        private const string SessionKey = "rdm.gamification.sessionId";

        public string Token { get; private set; }
        public string SessionId { get; private set; }
        public bool HasToken => !string.IsNullOrEmpty(Token);

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

        public void SetSession(string sessionId, string token)
        {
            SessionId = sessionId;
            Token = token;
            PlayerPrefs.SetString(SessionKey, sessionId);
            PlayerPrefs.SetString(TokenKey, token ?? string.Empty);
            PlayerPrefs.Save();
        }

        public void ClearSession()
        {
            SessionId = null;
            Token = null;
            PlayerPrefs.DeleteKey(SessionKey);
            PlayerPrefs.DeleteKey(TokenKey);
            PlayerPrefs.Save();
        }

        private void Start()
        {
            // Restaurar sesión persistida si existe.
            SessionId = PlayerPrefs.GetString(SessionKey, null);
            Token = PlayerPrefs.GetString(TokenKey, null);
        }
    }
}
