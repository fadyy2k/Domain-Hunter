# Security Policy

## Supported Versions

We support the latest version of DomainHunter. Please ensure you are running the most recent release to have the latest security patches.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in DomainHunter, please create a GitHub Issue with the label "security" or email the maintainer directly if sensitive info is involved. We will address it as soon as possible.

## Data Security & Privacy

### API Keys
DomainHunter allows users to save registrar API keys (Namecheap, GoDaddy) locally for checking prices and purchasing.
-   **Encryption**: Keys are encrypted using **AES-256-GCM** before being saved to the local database.
-   **Storage**: Keys function client-side or on your self-hosted instance. No keys are sent to any central DomainHunter server (as this is an open-source tool, you own the server).
-   **Transmission**: Keys are only used to communicate directly with Registrar APIs via the secure backend proxy.

### Environment Variables
-   Never commit your `.env` file.
-   Ensure `ENCRYPTION_KEY` is a strong, 32-character random string.
-   Ensure `DATABASE_URL` is kept secret in production environments.

### Threat Model
DomainHunter is designed as a self-hosted open-source tool. You are responsible for securing the server (VPS) it runs on. We recommend:
-   Running behind a reverse proxy (Nginx/Caddy) with HTTPS (SSL/TLS).
-   Using firewalls (UFW) to granularly control access.
-   Rotating your `ENCRYPTION_KEY` if you suspect a server breach (note: this will invalidate stored keys).
