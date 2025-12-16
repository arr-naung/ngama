# Troubleshooting: Port Already in Use

If you notify that your server isn't starting or you can't sign in locally because the API isn't running, it might be because a "zombie" process is holding onto the port (3000 or 3001).

## Symptoms
- `npm run dev` fails immediately.
- Error message: `EADDRINUSE: address already in use :::3001`
- You can't sign in (Server error) even though you think the server is running.

## The Fix (Windows)

1. **Find the Process ID (PID)**
   Open your terminal and run:
   ```powershell
   netstat -ano | findstr :3001
   ```
   *Replace `3001` with `3000` if the web app is failing.*

   You will see output like:
   ```
   TCP    0.0.0.0:3001           0.0.0.0:0              LISTENING       12345
   ```
   The number at the end (`12345`) is the **PID**.

2. **Kill the Process**
   Run this command using the PID you found:
   ```powershell
   taskkill /F /PID 12345
   ```

3. **Restart Server**
   ```powershell
   npm run dev
   ```
