// ==================================================================
// Assets/Plugins/WebGL/RDMWebGL.jslib
// ------------------------------------------------------------------
// Plugin nativo WebGL (Emscripten) del RDM Digital Hub.
// Expone `RDMNotify` al runtime de C# para enviar eventos JSON al
// host web (Next.js). El host escucha en `window.rdmUnityBridge`.
// ==================================================================

mergeInto(LibraryManager.library, {
  RDMNotify: function (jsonPtr) {
    var json = UTF8ToString(jsonPtr);
    if (typeof window !== 'undefined' && window.rdmUnityBridge) {
      try {
        window.rdmUnityBridge.onMessage(JSON.parse(json));
      } catch (err) {
        console.warn('[RDM-BRIDGE] mensaje no parseable:', err);
      }
    } else {
      console.log('[RDM-BRIDGE]', json);
    }
  },
});
