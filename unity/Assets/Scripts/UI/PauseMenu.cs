// ==================================================================
// Scripts/UI/PauseMenu.cs
// ------------------------------------------------------------------
// Menú de pausa: congela el juego y permite reanudar/salir.
// ==================================================================

using UnityEngine;

namespace RDM.YUN.UI
{
    public sealed class PauseMenu : MonoBehaviour
    {
        [SerializeField] private GameObject panel;
        [SerializeField] private KeyCode pauseKey = KeyCode.Escape;

        private bool isPaused;

        private void Start()
        {
            if (panel != null) panel.SetActive(false);
        }

        private void Update()
        {
            if (Input.GetKeyDown(pauseKey))
            {
                TogglePause();
            }
        }

        public void TogglePause()
        {
            isPaused = !isPaused;
            Time.timeScale = isPaused ? 0f : 1f;
            if (panel != null) panel.SetActive(isPaused);
            Cursor.lockState = isPaused ? CursorLockMode.None : CursorLockMode.Locked;
            Cursor.visible = isPaused;
        }

        public void Resume()
        {
            if (isPaused) TogglePause();
        }

        public void QuitToMenu()
        {
            Time.timeScale = 1f;
            GameCore.GameManager.Instance.GameOver();
            UnityEngine.SceneManagement.SceneManager.LoadScene("MainMenu");
        }
    }
}
