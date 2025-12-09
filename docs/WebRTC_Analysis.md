# Analisi WebRTC: Ottimizzazione per Rete Locale (LAN) e Video-Only

Questa analisi è specifica per l'architettura **LocalStream**: server e client sempre nella stessa rete locale, multi-dispositivo, **esclusivamente video (no audio)**.

L'obiettivo è massimizzare la qualità visiva sfruttando l'elevata banda disponibile in LAN, riducendo al minimo la latenza.

## 1. Acquisizione Media (Video Only)

Disabilitare completamente l'audio alla fonte è il primo passo fondamentale. Risparmia:
- Banda (circa 30-100 kbps per stream).
- CPU (niente encoding/decoding, cancellazione eco, etc.).
- Complessità di sincronizzazione A/V.

### Constraints Ottimizzati
```javascript
const constraints = {
    audio: false, // ✅ DISABILITATO COMPLETAMENTE
    video: {
        width: { ideal: 1920, max: 3840 }, // Supporto 4K se la LAN regge
        height: { ideal: 1080, max: 2160 },
        frameRate: { ideal: 60, max: 60 }, // 60fps fluido su LAN
        facingMode: 'environment',
        resizeMode: 'none' // Evita scaling CPU sul telefono
    }
};
```

## 2. Configurazione Network (LAN Only)

In una rete locale, non abbiamo bisogno di server STUN/TURN pubblici (Google, ecc.). Usarli rallenterebbe solo la negoziazione (candidate gathering) o fallirebbe senza internet.

### `RTCPeerConnection` Config
```javascript
const peerConfig = {
    // ✅ NESSUN server STUN esterno. 
    // WebRTC userà gli indirizzi IP locali e mDNS.
    iceServers: [], 
    
    // Forza connessioni dirette (Host candidates only)
    iceTransportPolicy: 'all', 
    
    // Ottimizzazione bundle
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
};
```
*Nota: Se la connessione fallisce su alcune reti aziendali complesse, un mini server STUN locale sul server Node.js potrebbe aiutare, ma nel 99% delle LAN domestiche `[]` è sufficiente e più veloce.*

## 3. Gestione Banda e Codec (High Bitrate)

In LAN Wi-Fi 5/6, abbiamo realisticamente 100-500 Mbps reali condivisi.
- Un flusso 1080p60 H.264 richiede ~6-10 Mbps per alta qualità.
- Possiamo permetterci bitrates molto più alti dello standard WebRTC (che di solito parte cauto a 2 Mbps).

### Selezione Codec
In LAN, la **latenza di encoding** è il collo di bottiglia principale, non la banda.
- **H.264 (Hardware Profile)**: SCELTA CONSIGLIATA. 
    - Codifica/Decodifica hardware su quasi tutti i cellulari/PC.
    - Latenza minima (< 10ms encoding).
    - Meno CPU = meno throttling termico sul telefono.
- **VP8/VP9**: Sconsigliati se software (troppa CPU per 1080p60). Supportati via HW solo su device recenti.

### Forzare Bitrate Alto (Hack WebRTC)
WebRTC è conservativo. In LAN dobbiamo forzare il bitrate a salire subito.

```javascript
params.encodings[0].maxBitrate = 15000000; // Start a 15 Mbps (invece di 2.5)
params.encodings[0].minBitrate = 4000000;  // Non scendere sotto i 4 Mbps
```

## 4. Multi-Dispositivo e Congestione Wi-Fi

Il vero limite "Local Network" è l'airtime del Wi-Fi.
- Se hai 4 telefoni che trasmettono a 10Mbps ciascuno = 40Mbps totali costanti.
- Su Wi-Fi 2.4GHz questo saturerà il canale ⇒ packet loss ⇒ scatti.
- **Soluzione**: Obbligare l'uso del **Wi-Fi 5GHz** o **6GHz (Wi-Fi 6)**.

### Strategia di Priorità
Poiché non c'è audio, tutto lo spazio è per il video.
Impostare `networkPriority: 'high'` è utile per dire al router (se supporta DSCP/WMM) di dare priorità a questi pacchetti rispetto al traffico background della LAN.

## 5. Latenza Ultra-Low (Real-time)

In LAN il RTT (Round Trip Time) è < 5ms. Il buffer "jitter" è inutile e dannoso.

### Ricevitore (Browser/OBS)
Rimuovere ogni buffer per avere "tempo reale" (utile per puntamento camere, droni, etc.).

```javascript
// Sul lato ricevitore (remote track)
const receiver = pc.getReceivers().find(r => r.track.kind === 'video');
if (receiver.playoutDelayHint !== undefined) {
    receiver.playoutDelayHint = 0; // 0s buffer. Max real-time.
}
```

*Nota: Se si vedono "glitch" o scatti neri, alzare a 0.05 (50ms).*

## 6. Riepilogo Ottimizzazioni da Applicare

1.  **Audio**: Rimuovere `audio: true` da `getUserMedia` e da `offerToReceiveAudio`.
2.  **ICE**: Rimuovere array `iceServers` in `config.json`.
3.  **Codec**: Imporre H.264 per sgravare la CPU dei telefoni.
4.  **Bitrate**: Modificare `webrtc-client.js` per settare `maxBitrate` a 10-15Mbps.
5.  **Buffer**: Azzerare `playoutDelayHint` nel viewer.
