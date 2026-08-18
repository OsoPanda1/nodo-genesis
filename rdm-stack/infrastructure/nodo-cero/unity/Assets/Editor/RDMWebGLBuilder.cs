// ==================================================================
// Assets/Editor/RDMWebGLBuilder.cs
// ------------------------------------------------------------------
// Herramienta de Editor para compilar el build WebGL de la Arena 3D
// (Zombies RDM Invasion) y volcarlo en `unity/Builds/WebGL/`.
// Menú: Tools > RDM > Build WebGL Arena
// El build se sirve en producción desde `public/unity/` (Next.js).
// ==================================================================

using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace RDM.YUN.EditorTools
{
    public static class RDMWebGLBuilder
    {
        private const string ScenePath = "Assets/Scenes/RDMArena.unity";
        private const string OutputDir = "Builds/WebGL";
        private const string OutputName = "RDMArena";
        private const string TemplateName = "RDM";

        [MenuItem("Tools/RDM/Build WebGL Arena")]
        public static void BuildWebGL()
        {
            string scenePath = RDMArenaSceneSetup.CreateScene() ?? ScenePath;
            if (!File.Exists(scenePath))
            {
                Debug.LogError("[RDM-BUILD] No existe la escena " + scenePath + ". Crea la escena RDMArena primero.");
                return;
            }

            string outputPath = Path.Combine(OutputDir, OutputName);
            Directory.CreateDirectory(outputPath);

            var options = new BuildPlayerOptions
            {
                scenes = new[] { scenePath },
                locationPathName = outputPath,
                target = BuildTarget.WebGL,
                options = BuildOptions.None,
            };

            PlayerSettings.WebGL.template = TemplateName;
            PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Brotli;
            PlayerSettings.WebGL.memorySize = 512;

            BuildReport report = BuildPipeline.BuildPlayer(options);
            if (report.summary.result == BuildResult.Succeeded)
            {
                Debug.Log($"[RDM-BUILD] Build WebGL correcto en {outputPath}.");
                Debug.Log("[RDM-BUILD] Copia el contenido a /public/unity/ para servirlo desde Next.js.");
            }
            else
            {
                Debug.LogError($"[RDM-BUILD] Build falló: {report.summary.result} ({report.summary.totalErrors} errores).");
            }
        }

        [MenuItem("Tools/RDM/Abrir carpeta de build")]
        public static void OpenBuildFolder()
        {
            string fullPath = Path.GetFullPath(OutputDir);
            Directory.CreateDirectory(fullPath);
            System.Diagnostics.Process.Start("explorer.exe", fullPath);
        }
    }
}
