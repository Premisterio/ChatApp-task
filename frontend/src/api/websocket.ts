export class WebSocketManager {
  private ws: WebSocket | null = null;

  connect(token: string, onMessage: (data: any) => void) {
    this.ws = new WebSocket(`ws://localhost:8000/ws?token=${token}`);  // Will change localhost to an actual api link

    this.ws.onopen = () => console.log("✅ WebSocket connected");
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };
    this.ws.onclose = () => console.log("❌ WebSocket closed");
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.ws) this.ws.close();
  }
}
