# FraudMesh Deployment Guide

**FraudMesh: Privacy-Preserving Federated Graph Learning for Cross-Bank Mule Account Detection in UPI using Digital Twin Technology**

---

## 1. Local Production Deployment (Active Right Now)

The frontend React single-page application is compiled into `fraudmesh/web/dist` and directly served by the FastAPI application with unified routing and API integration:

* **Production Unified URL**: [http://localhost:8000/](http://localhost:8000/)
* **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **API Route Prefix**: `/api/*`
* **Vite Hot-Reload Dev Console**: [http://localhost:5173/](http://localhost:5173/)

To restart the production server anytime, simply double-click:
```bash
fraudmesh\start_fraudmesh.bat
```
Or run in PowerShell:
```powershell
cd "c:\Users\ASUS\Desktop\EDI PROJECT\fraudmesh\api"
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 2. Accessing from Another Laptop or Phone on Local Wi-Fi

Since the server is bound to `0.0.0.0:8000`, anyone on the same Wi-Fi / LAN network (guides, jury members, team members) can access the live dashboard from their phone, tablet, or laptop:

1. Find your machine's local IP address:
   ```powershell
   ipconfig
   # Look for "IPv4 Address", e.g. 192.168.1.45
   ```
2. On any other device connected to the same Wi-Fi, open:
   ```
   http://<YOUR_LOCAL_IP>:8000/
   ```

---

## 3. Instant Public URL Sharing (Cloudflare Tunnel or LocalTunnel)

To create an instant, secure public HTTPS link for external reviewers without setting up cloud accounts:

### Using LocalTunnel (via npx, zero installation needed):
```powershell
npx localtunnel --port 8000
```
This gives a live public URL (e.g. `https://quick-mule-detector.loca.lt`) that routes directly to your running FraudMesh server.

---

## 4. Deploying to Free Cloud Platforms (Render / Railway / Fly.io)

### Deploying to Render.com:
1. Push your `fraudmesh` folder to GitHub.
2. Go to [https://dashboard.render.com/](https://dashboard.render.com/) and click **New + > Web Service**.
3. Connect your repository.
4. Render will automatically detect `render.yaml` or you can specify:
   * **Build Command**: `cd web && npm install && npm run build && cd ../api && pip install -r requirements.txt`
   * **Start Command**: `cd api && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click **Create Web Service**. Render provides a free `https://fraudmesh.onrender.com` URL.

---

## 5. Docker Container Deployment

If Docker is installed on a production host, build and run the multi-stage image with a single command:

```bash
cd fraudmesh
docker compose up --build -d
```
The Docker container automatically builds the frontend in Node 20, copies static assets into the Python 3.11 image, and serves both via Uvicorn on port 8000.
