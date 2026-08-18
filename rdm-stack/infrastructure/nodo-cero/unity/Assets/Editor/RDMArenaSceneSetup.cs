// ==================================================================
// Assets/Editor/RDMArenaSceneSetup.cs
// ------------------------------------------------------------------
// Genera la escena base `Assets/Scenes/RDMArena.unity` mediante la
// API del Editor (EditorSceneManager), evitando YAML manual. Se invoca
// desde Tools > RDM > Create Arena Scene o automáticamente desde el
// builder WebGL cuando la escena no existe.
// ==================================================================

using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace RDM.YUN.EditorTools
{
    public static class RDMArenaSceneSetup
    {
        private const string ScenesDir = "Assets/Scenes";
        private const string ScenePath = ScenesDir + "/RDMArena.unity";

        [MenuItem("Tools/RDM/Create Arena Scene")]
        public static void CreateSceneMenuItem()
        {
            string path = CreateScene();
            if (path != null)
            {
                EditorSceneManager.OpenScene(path, OpenSceneMode.Single);
                Debug.Log("[RDM-SCENE] Escena creada y abierta: " + path);
            }
        }

        public static string CreateScene()
        {
            if (!Directory.Exists(ScenesDir)) Directory.CreateDirectory(ScenesDir);
            if (File.Exists(ScenePath)) return ScenePath;

            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
            if (Camera.main != null) Object.DestroyImmediate(Camera.main.gameObject);

            // Cámara principal
            var cameraGo = new GameObject("Main Camera");
            cameraGo.tag = "MainCamera";
            var camera = cameraGo.AddComponent<Camera>();
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0.05f, 0.08f, 0.12f);
            cameraGo.transform.position = new Vector3(0f, 1.6f, -4f);
            cameraGo.AddComponent<AudioListener>();

            // Luz direccional
            var lightGo = new GameObject("Directional Light");
            var light = lightGo.AddComponent<Light>();
            light.type = LightType.Directional;
            light.intensity = 1.1f;
            lightGo.transform.rotation = Quaternion.Euler(50f, -30f, 0f);

            // Bootstrap de la arena (construye el resto en runtime)
            var arenaGo = new GameObject("RDM Arena");
            arenaGo.AddComponent<GameCore.RDMArenaBootstrap>();

            EditorSceneManager.MarkSceneDirty(scene);
            EditorSceneManager.SaveScene(scene, ScenePath);
            return ScenePath;
        }
    }
}
