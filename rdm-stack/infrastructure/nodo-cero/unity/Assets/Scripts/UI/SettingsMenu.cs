// ==================================================================
// Scripts/UI/SettingsMenu.cs
// ------------------------------------------------------------------
// Ajustes de sensibilidad, volumen y calidad (persistidos en PlayerPrefs).
// ==================================================================

using UnityEngine;
using UnityEngine.Audio;
using UnityEngine.UI;

namespace RDM.YUN.UI
{
    public sealed class SettingsMenu : MonoBehaviour
    {
        [SerializeField] private AudioMixer mixer;
        [SerializeField] private Slider sensitivitySlider;
        [SerializeField] private Slider volumeSlider;
        [SerializeField] private Slider qualitySlider;

        private const string SensKey = "rdm.sensitivity";
        private const string VolKey = "rdm.volume";

        private void Start()
        {
            sensitivitySlider.value = PlayerPrefs.GetFloat(SensKey, 2f);
            volumeSlider.value = PlayerPrefs.GetFloat(VolKey, 1f);
            qualitySlider.value = PlayerPrefs.GetInt("rdm.quality", 2);
        }

        public void OnSensitivityChanged(float value)
        {
            PlayerPrefs.SetFloat(SensKey, value);
            // En un build real: FindObjectOfType<PlayerController>().SetSensitivity(value);
        }

        public void OnVolumeChanged(float value)
        {
            PlayerPrefs.SetFloat(VolKey, value);
            mixer?.SetFloat("MasterVolume", Mathf.LinearToDecibels(Mathf.Max(0.0001f, value)));
        }

        public void OnQualityChanged(float value)
        {
            int level = Mathf.RoundToInt(value);
            QualitySettings.SetQualityLevel(level, true);
            PlayerPrefs.SetInt("rdm.quality", level);
        }
    }
}
