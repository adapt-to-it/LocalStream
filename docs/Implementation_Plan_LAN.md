# Implementazione Ottimizzazioni LocalStream (LAN / Multi-Device)

Basato sulla richiesta: "100ms ritardo accettabile in cambio di desaturazione rete per multi-dispositivo".

## 1. Strategia di Desaturazione
Per permettere più dispositivi in alta qualità senza collassare il Wi-Fi:
- **Bitrate Cap**: Invece di "illimitato", limitiamo a **6 Mbps (6000 kbps)** per 1080p60. È il "sweet spot" per H.264 dove la qualità è ottima ma lo stress di rete è la metà rispetto a 12-15 Mbps.
- **Latency / Buffer**: Impostiamo un buffer di **100ms (0.1s)**. Questo permette al protocollo TCP/UDP di riordinare i pacchetti e gestire brevi picchi di traffico senza scatti visibili.

## 2. Modifiche ai File

### A. `config.json`
- Rimuovere `iceServers` (uso LAN diretta).

### B. `streamer.js`
- `audio: false` (Risparmio fisso di banda e CPU).
- Aggiornamento constraints video.

### C. `webrtc-client.js`
- **Forzatura H.264**: Efficienza CPU (meno calore) ed efficienza compressione standard.
- **Bitrate Control**: Applicare `maxBitrate = 6000000` (6Mbps).
- **Buffer Hint**: `receiver.playoutDelayHint = 0.1`.

## Procedura
1. Modifica `config.json`.
2. Modifica `webrtc-client.js` (Logica core).
3. Modifica `streamer.js` (Disattivazione audio).
