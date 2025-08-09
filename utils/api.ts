const BACKEND_URL = "http://<YOUR-IP>:8000";

export const setShapes = async (shapes: any) => {
  await fetch(`${BACKEND_URL}/set_shapes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(shapes),
  });
};

export const startDetection = async () => {
  await fetch(`${BACKEND_URL}/start_detection/`, {
    method: "POST",
  });
};

export const sendPushToken = async (token: string) => {
  await fetch(`${BACKEND_URL}/set_push_token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}; 