# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-07

### Added
- **WebRTC Streaming**: Low-latency peer-to-peer streaming (<100ms).
- **Mobile App**:
  - Fullscreen preview mode with sophisticated camera controls (Brightness, Contrast, Saturation, White Balance).
  - Quality presets (4K60, 1080p60, etc.).
  - Front/Back camera switching.
- **Desktop Dashboard**:
  - Real-time stream monitoring.
  - QR Code generation for easy mobile connection.
- **OBS Integration**:
  - HTTP stream endpoints for compatibility with OBS Browser Source.
  - Auto-play and auto-reconnect logic.
- **Server**:
  - Dual HTTP (3000) and HTTPS (3443) support for maximum compatibility (iOS requires HTTPS, OBS prefers HTTP).
  - Multicast DNS (mDNS) support for local network discovery.
- **Build System**:
  - `pkg` integration for creating standalone executables (Mac, Windows, Linux).
  - GitHub Actions workflow for automated releases.

### Fixed
- WebRTC signaling flow (Viewer now initiates offer).
- Socket.IO connection issues on different protocols.
- "Start Streaming" button state after stopping stream.
- Layout issues on mobile interface.

### Security
- Self-signed certificate generation for local HTTPS.
