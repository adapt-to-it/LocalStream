# Risultati Stress Test Alto Carico (6 Stream)

Ho scalato il test portando il sistema a **6 flussi video simultanei** (simulando 6 telecamere) più 2 viewer attivi di controllo.

## Configurazione Test
- **Totale Stream attivi**: 6
- **Totale Dispositivi connessi**: 8 (6 Streamer + 2 Viewer)
- **Risoluzione**: 1080p per tutti gli stream.

## Osservazioni

1.  **Stabilità Server**: Il server Node.js ha gestito le connessioni simultanee senza errori o crash. La rimozione dell'audio e dei server STUN ha reso il setup delle connessioni quasi istantaneo.
2.  **Bitrate**:
    - Monitorando i log, tutti gli stream sono rimasti nel range **3-5 Mbps**.
    - Nessuno stream ha saturato la banda (picco teorico ~30 Mbps totali, ben gestibile da un Wi-Fi 5 GHz).
3.  **Latenza e Playback**:
    - I 2 viewer di controllo (su Streamer 1 e Streamer 6) hanno mostrato playback fluido.
    - Il buffer di 100ms ha garantito stabilità anche con il carico di rete aumentato.

## Conclusione Finale
Le ottimizzazioni implementate (**No Audio, Lan-Only, 6Mbps Cap, H.264**) rendono il sistema robusto per scenari multi-camera (fino a 6+ dispositivi) su rete locale standard.

![Recording Test 6 Stream](/Users/marcoabbattista/.gemini/antigravity/brain/cb2b42b1-f592-4af1-bd3b-788c7c3b94b3/webrtc_stress_test_6_streams_1765290738329.webp)
