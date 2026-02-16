# Incident Report: The "Ghost" Malware Breach
**Date of Investigation**: Feb 16, 2026
**Target**: Ubuntu VPS (youtubersity.xyz / youtubersity.online)

## 1. The Entry Vector (The "How")
The attacker likely gained access via the SSH port (22) during the initial project hosting in mid-January. They likely used a brute-force attack or exploited a temporary weakness during setup.

## 2. The Malware Spec (`jk7QqpAI`)
- **Category**: Remote Access Trojan (RAT) & Crypto-Miner.
- **Stealth Strategy**:
    - **Ghosting**: The binary was deleted from `/tmp` immediately after starting, making it invisible to many basic file scans.
    - **Session Hiding**: The attacker used SSH connections without a TTY (terminal), meaning they didn't show up in the `w` command.
    - **RAM Residency**: The process survived for 34 days because it lived in the server's memory, even after project files were "deleted" and reinstalled.
- **C2 Server (The Brains)**: `57.129.123.150` (OVH Germany).
- **Intruder IP**: `165.245.134.186`.

## 3. Persistence Mechanisms
- **Cron Backdoor**: A malicious script at `/etc/cron.d/staticroute` was configured to auto-download and restart the malware if the process was killed.
- **Immutable Files**: Use of `chattr +i` on critical binaries (like `node`) to prevent the root user from deleting or modifying the compromised files.
- **Environment Hijack**: Modification of `.bashrc` to control the user's terminal experience and hide symptoms.
