// ==================================================================
// Scripts/Networking/SecureApiClient.cs
// ------------------------------------------------------------------
// Wrapper HTTP/HTTPS hacia el backend YUN con UnityWebRequest:
// JSON, reintentos con backoff, manejo de errores y timeouts.
// ==================================================================

using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

namespace RDM.YUN.Networking
{
    public sealed class SecureApiClient
    {
        private const int MaxRetries = 3;
        private const float RetryBackoffSeconds = 1.2f;

        public IEnumerator PostJson<T>(
            string path,
            object payload,
            Action<T> onSuccess,
            Action<string> onError)
        {
            string json = JsonUtility.ToJson(payload);
            int attempts = 0;
            bool done = false;

            while (!done && attempts < MaxRetries)
            {
                attempts++;
                using (var request = new UnityWebRequest(path, "POST"))
                {
                    request.uploadHandler = new UploadHandlerRaw(System.Text.Encoding.UTF8.GetBytes(json));
                    request.downloadHandler = new DownloadHandlerBuffer();
                    request.SetRequestHeader("Content-Type", "application/json");

                    yield return request.SendWebRequest();

                    if (request.result == UnityWebRequest.Result.Success)
                    {
                        try
                        {
                            onSuccess?.Invoke(JsonUtility.FromJson<T>(request.downloadHandler.text));
                        }
                        catch (Exception ex)
                        {
                            onError?.Invoke($"deserialize: {ex.Message}");
                        }
                        done = true;
                    }
                    else if (attempts >= MaxRetries)
                    {
                        onError?.Invoke($"{request.responseCode}: {request.error}");
                        done = true;
                    }
                    else
                    {
                        yield return new WaitForSeconds(RetryBackoffSeconds * attempts);
                    }
                }
            }
        }

        public IEnumerator GetJson<T>(string path, Action<T> onSuccess, Action<string> onError)
        {
            using (var request = UnityWebRequest.Get(path))
            {
                request.downloadHandler = new DownloadHandlerBuffer();
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    try
                    {
                        onSuccess?.Invoke(JsonUtility.FromJson<T>(request.downloadHandler.text));
                    }
                    catch (Exception ex)
                    {
                        onError?.Invoke($"deserialize: {ex.Message}");
                    }
                }
                else
                {
                    onError?.Invoke($"{request.responseCode}: {request.error}");
                }
            }
        }
    }
}
