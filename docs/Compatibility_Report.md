# Rapporto di Compatibilità: Ottimizzazioni WebRTC per LocalStream

Ho analizzato il codice sorgente corrente (`streamer.js`, `viewer.js`, `webrtc-client.js`, `config.json`) per verificare la fattibilità delle ottimizzazioni LAN/Video-Only.

## Esito: ✅ PIENAMENTE COMPATIBILE

L'architettura attuale è modulare e permette di applicare tutte le modifiche richieste senza ristrutturazioni maggiori.

### Dettaglio Verifiche

#### 1. Disattivazione Audio (`audio: false`)
- **Impatto**: Il codice gestisce gli stream in modo agnostico (iterando su `getTracks()`).
- **Rischio**: Basso.
- **Verifica**: `viewer.js` tenta di riprodurre l'audio (`muted = false` per OBS). Se non arriva una traccia audio, il browser riprodurrà semplicemente il video muto senza errori. La logica di "autoplay fallback" rimarrà valida.

#### 2. Rimozione Server ICE (`iceServers: []`)
- **Impatto**: `WebRTCClient` accetta array vuoti.
- **Rischio**: Nullo in LAN.
- **Vantaggio**: Faster connection establishment (nessuna attesa candidate gathering esterni).

#### 3. Forzatura H.264 e Bitrate Alto
- **Impatto**: Richiede l'aggiunta di logica in `webrtc-client.js`.
- **Compatibilità**:
    - **Android (Chrome)**: Supporto H.264 hardware diffuso.
    - **iOS (Safari)**: H.264 è il codec nativo preferito. Performance eccellenti previste.
    - **OBS (Browser Source)**: Usa CEF (Chromium), supporta H.264 e alti bitrate.

#### 4. Zero Latency (Buffer 0ms)
- **Impatto**: Modifica in `webrtc-client.js` durante l'evento `ontrack`.
- **Rischio**: Possibili micro-glitch su Wi-Fi instabile, ma accettabile per puntamento real-time.

## Piano di Implementazione (Sicuro)

Non romperemo il sistema attuale. Procederemo modificando i file esistenti con le seguenti cautele:

1.  **Configurazione (`config.json`)**: Svuotare `iceServers`.
2.  **Shared Lib (`webrtc-client.js`)**:
    - Aggiungere metodo `optimizeForLAN()` che applica H.264, Bitrate 15Mbps e Buffer 0.
    - Questo metodo verrà chiamato dopo la creazione della connessione.
3.  **Streamer (`streamer.js`)**:
    - Aggiornare `constraints` per rimuovere audio.
4.  **Viewer (`viewer.js`)**:
    - Nessuna modifica necessaria se gestiamo il buffer layout in `webrtc-client.js`.

### Procediamo?
Sono pronto ad applicare queste modifiche in sequenza sicura.
