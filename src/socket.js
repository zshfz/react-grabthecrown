import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  auth: {
    token: localStorage.getItem("token"),
  },
  autoConnect: false,
});

socket.on("connect_error", (err) => {
  console.error("❌ 소켓 연결 실패:", err.message);
});

export default socket;
