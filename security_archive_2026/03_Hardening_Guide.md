# Hardening Guide: Protecting the Fortress

## 1. SSH Hardening (The Front Door)
- **Install Fail2Ban**: This is the single most important tool. It automatically bans IPs that fail login attempts 3+ times.
  ```bash
  sudo apt update && sudo apt install fail2ban -y
  ```
- **Change SSH Port**: Move SSH from port **22** to a random port like **2222** or **49152**. Most botnets only scan the default port.
- **Disable Root Login**: Create a standard user with `sudo` and disable direct root SSH access in `/etc/ssh/sshd_config`.

## 2. Process Monitoring (The Interior Guard)
- **PM2 Vigilance**: Regularly check `pm2 list`. If you see a process you didn't start, or a process with high CPU usage you don't recognize, investigate immediately.
- **Check the "Hidden" List**: Use `ss -antp` instead of `w`. It shows every actual network connection, even the "hidden" ones.

## 3. Web Layer Security
- **Nginx Protection**: Ensure Nginx only listens on 80/443 and that all internal ports (3000, 4000, etc.) are blocked by a firewall (like `ufw`) from the outside world.
- **Environment Safety**: Never commit your `.env` files to Git.

## 4. The "Ghost Check" Command
If you suspect you've been hacked again, run this to find processes with "deleted" files:
```bash
ls -la /proc/*/exe | grep "(deleted)"
```
*(Healthy "deleted" files are usually just log files. If you see a binary in `/tmp` or `/root` marked as deleted but still running, it is 100% a virus.)*
