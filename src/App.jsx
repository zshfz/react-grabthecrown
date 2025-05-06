import { Routes, Route } from "react-router-dom";
import Background from "./components/Background";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import "./App.css";
import ChatRoom from "./pages/ChatRoom";

function App() {
  return (
    <>
      <Background />
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/chat-room/:id" element={<ChatRoom />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
