// ==================================================================
// Scripts/UI/HUDController.cs
// ------------------------------------------------------------------
// HUD del guardián: vida, oleada, combo y puntuación (leída del
// ScoreClient, nunca calculada aquí).
// ==================================================================

using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace RDM.YUN.UI
{
    public sealed class HUDController : MonoBehaviour
    {
        [SerializeField] private Image healthBar;
        [SerializeField] private TextMeshProUGUI waveText;
        [SerializeField] private TextMeshProUGUI comboText;
        [SerializeField] private TextMeshProUGUI sessionText;

        private GameCore.GameManager game;
        private GameCore.PlayerHealth playerHealth;

        private void Awake()
        {
            game = GameCore.GameManager.Instance;
            playerHealth = FindObjectOfType<GameCore.PlayerHealth>();
            if (playerHealth != null) playerHealth.OnHealthChanged += OnHealthChanged;
        }

        private void OnDestroy()
        {
            if (playerHealth != null) playerHealth.OnHealthChanged -= OnHealthChanged;
        }

        private void OnHealthChanged(int health)
        {
            if (healthBar != null && playerHealth != null)
            {
                healthBar.fillAmount = (float)health / playerHealth.MaxHealth;
            }
        }

        private void Update()
        {
            if (game != null)
            {
                if (waveText != null) waveText.text = $"Oleada {game.currentWave}";
                if (comboText != null) comboText.text = game.comboCount >= 2 ? $"Combo ×{game.comboCount}" : string.Empty;
            }
        }
    }
}
