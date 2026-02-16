# Cleanup and Restoration Log

## Phase 1: Forensic Identification
- Detected a suspicious SSH session from `165.245.134.186` via `ss -antp`.
- Found process `jk7QqpAI` (PID 77889) running with a deleted executable.
- Traced its start date to **Jan 20th**, confirming it survived the user's late-January cleanup.

## Phase 2: The "Nuclear" Strike
1. **Disabled Persistence**: Deleted `/etc/cron.d/staticroute` and other malicious cron entries.
2. **Killed Malware**: Terminated PID 77889 and the hidden SSH shells.
3. **Unlocked System**: Used `chattr -i` to remove immutable flags from corrupted Node binaries.
4. **Wiped Environment**: Purged corrupted `.bashrc` and `.profile` files.

## Phase 3: Restoration
1. **Fresh Node Runtime**: Used NVM to install a clean version of Node v20.19.6.
2. **PM2 Recovery**: Reinstalled PM2 globally.
3. **App Resurrection**: 
    - Resolved `DATABASE_URL` missing errors.
    - Configured correct `--cwd` (Working Directories) for PM2.
    - Synced Nginx ports: **Port 4000** for X-Clone and **Port 3000** for Mastery Learning.
- **Rebooted**: Performed a hardware-level reboot to ensure 100% of the RAM was cleared of malicious code.
