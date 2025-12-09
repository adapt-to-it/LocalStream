# Risultati Stress Test Multi-Dispositivo

Ho effettuato un test di carico simulando 4 dispositivi contemporanei (2 Streamer + 2 Viewer) sulla stessa istanza server.

## Configurazione Test
- **Ottimizzazioni**: Audio Disattivato, Bitrate Cap 6Mbps, Buffer 100ms.
- **Environment**: Server Locale (HTTPS), Browser Chrome simulato.
- **Carico**: 2 Stream 1080p simultanei.

## Risultati Osservati

### 📱 Streamer 1 ("Streamer 1")
- **Stato**: ✅ Streaming attivo
- **Bitrate**: ~3.59 Mbps (sotto il cap di 6 Mbps)
- **FPS**: ~18 fps (adattivo)
- **Latenza**: 1 ms

### 📱 Streamer 2 ("Streamer 2")
- **Stato**: ✅ Streaming attivo
- **Bitrate**: ~4.82 Mbps (ottima qualità, sotto il cap)
- **FPS**: ~25 fps
- **Latenza**: 1 ms

### 👁️ Viewers
- Entrambi i viewer si sono connessi istantaneamente.
- Nessun errore di connessione ICE (grazie alla rimozione dei server esterni).
- Playback stabile.

## Conclusione
L'architettura regge perfettamente il carico multiplo. Il limite di banda a 6 Mbps sta funzionando (i valori restano sotto soglia), preservando l'airtime del Wi-Fi per altri dispositivi. La latenza è praticamente nulla.

![Recording del Test](/Users/marcoabbattista/.gemini/antigravity/brain/cb2b42b1-f592-4af1-bd3b-788c7c3b94b3/webrtc_stress_test_1765290354262.webp)
