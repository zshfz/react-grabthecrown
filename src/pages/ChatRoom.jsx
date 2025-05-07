// src/pages/ChatRoom.jsx
import { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../socket";
import UserCard from "../components/UserCard";
import "../styles/ChatRoom.scss";
import { AuthContext } from "../context/AuthContext";
import quizList from "../data/quizList"; // 임시 데이터

const ChatRoom = () => {
  const QUIZ_TIME = 20;
  const { id: roomId } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [players, setPlayers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [isGameStart, setIsGameStart] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState("");
  const [chatMessage, setChatMessage] = useState([]); //수신된 메시지 목록
  const [inputMessage, setInputMessage] = useState(""); //사용자가 입력중인 메시지
  const currentQuiz = quizList[currentIndex];

  const chatEndRef = useRef(null); //채팅창 스크롤 자동으로 내려가도록

  // 1) 방 입장 시 초기 참가자 불러오기 (try/catch)
  useEffect(() => {
    socket.emit("join_room", { roomId: Number(roomId) });

    const fetchPlayers = async () => {
      try {
        const res = await axios.get(`${API}/gameroom/${roomId}/players`);
        console.log("▶ API response:", res.data);
        setPlayers(res.data);
      } catch (err) {
        console.error("유저 목록 조회 실패:", err);
        alert("참가자 목록을 불러오는 데 실패했습니다.");
      }
    };
    fetchPlayers();
  }, [API, roomId]);

  // 2) 소켓 이벤트로 참가/퇴장 실시간 반영 (try/catch 내부 fetch)
  useEffect(() => {
    const handleUserJoined = async () => {
      try {
        const res = await axios.get(`${API}/gameroom/${roomId}/players`);
        setPlayers(res.data);
      } catch (err) {
        console.error("유저 목록 갱신 실패:", err);
      }
    };

    const handleUserLeft = ({ userId }) => {
      setPlayers((prev) => prev.filter((p) => p.userId !== userId));
    };

    socket.on("user_joined", handleUserJoined);
    socket.on("user_left", handleUserLeft);

    return () => {
      socket.off("user_joined", handleUserJoined);
      socket.off("user_left", handleUserLeft);
    };
  }, [API, roomId]);

  // 퀴즈 타이머
  useEffect(() => {
    if (!isGameStart) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameStart]);

  // ② 서버가 강제종료(game_forced_end) 또는 정상종료(game_finished) 알리면
  useEffect(() => {
    socket.on("game_forced_end", ({ message }) => {
      alert(message);
      navigate("/lobby");
    });
    socket.on("game_finished", ({ message }) => {
      alert(message);
      navigate("/lobby");
    });
    return () => {
      socket.off("game_forced_end");
      socket.off("game_finished");
    };
  }, [navigate]);

  // ③ 3초마다 /gameroom 폴링: 방이 삭제되면 자동 alert + 로비 복귀
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/gameroom`);
        const exists = res.data.some((r) => r.roomId === Number(roomId));
        if (!exists) {
          alert("모든 플레이어가 나가 게임이 종료되었습니다.");
          clearInterval(intervalId);
          navigate("/lobby");
        }
      } catch (err) {
        console.error("방 상태 확인 실패:", err);
      }
    }, 3000);
    return () => clearInterval(intervalId);
  }, [API, roomId, navigate]);

  //채팅 이벤트 바인딩
  useEffect(() => {
    const handleIncoming = ({ userId, userName, message }) => {
      setChatMessage((prev) => [...prev, { userId, userName, message }]);
    };
    const handleBlocked = ({ message }) => {
      alert(message);
    };

    socket.on("chat_message", handleIncoming);
    socket.on("chat_blocked", handleBlocked);

    return () => {
      socket.off("chat_message", handleIncoming);
      socket.off("chat_blocked", handleBlocked);
    };
  }, []);

  //채팅창 스크롤 자동으로 내려가도록
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessage]);

  // ① 나가기 버튼 핸들러
  const handleLeave = () => {
    socket.emit("leave_room", { roomId: Number(roomId) });
    navigate("/lobby");
  };

  //메시지 전송 핸들러
  const handleSendMessage = () => {
    const trimmed = inputMessage.trim();
    if (!trimmed) return;
    socket.emit("chat_message", { roomId: Number(roomId), message: trimmed });
    setInputMessage("");
  };

  //엔터키로도 메시지 전송할 수 있도록
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-room">
      <div className="chat-room-left">
        <div className="chat-room-left-top">
          {isGameStart ? (
            <>
              {/* 타이머 */}
              <div className="chat-room-timer-container">
                <p className="chat-room-time-left">남은 시간: {timeLeft}초</p>
                <div
                  className="chat-room-timer"
                  style={{ width: `${(timeLeft / QUIZ_TIME) * 100}%` }}
                />
              </div>
              {/* 진행도 */}
              <div className="chat-room-progress">
                <h1>{`${quizList.length > 0 ? `라운드 ${1}` : ""}`}</h1>
                <p>
                  [{currentIndex + 1} / {quizList.length}]
                </p>
              </div>
              <div className="chat-room-divider" />
              {/* 퀴즈 문항 */}
              <div className="chat-room-quiz-container">
                <h1 className="chat-room-quiz-question">
                  Q. {currentQuiz.QUESTION}
                </h1>
                <ul className="chat-room-quiz-choice-container">
                  {currentQuiz.OPTIONS.map((opt, i) => (
                    <li
                      key={i}
                      className={
                        selectedChoice === i
                          ? "selected"
                          : "chat-room-quiz-choice"
                      }
                      onClick={() => setSelectedChoice(i)}
                    >
                      {i + 1}. {opt.CHOICE}
                    </li>
                  ))}
                </ul>
                <div className="chat-room-quiz-submit">
                  <button className="chat-room-quiz-submit-button">제출</button>
                </div>
              </div>
            </>
          ) : (
            <h4 className="chat-room-guide-instruction">
              방 인원이 다 차면 자동으로 게임이 시작합니다!
            </h4>
          )}
        </div>
        <div className="chat-room-left-bottom">
          {players.map((a) => (
            <UserCard key={a.userId} a={a} />
          ))}
        </div>
      </div>

      <div className="chat-room-right">
        <div className="chat-room-chat-area">
          <h4 className="chat-room-chat-area-header">채팅 목록</h4>
          <ul className="chat-room-messages">
            {chatMessage.map((a, i) => (
              <li
                key={i}
                className={
                  a.userId === currentUser?.userId
                    ? "chat-message-self"
                    : "chat-message-other"
                }
              >
                <strong>{a.userName}:</strong> {a.message}
              </li>
            ))}
            <div ref={chatEndRef} />
          </ul>
        </div>
        <div className="chat-room-input-container">
          <textarea
            className="chat-room-textarea"
            placeholder="메시지를 입력하세요."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button className="chat-room-button" onClick={handleSendMessage}>
            전송
          </button>
        </div>
        <div className="start-exit-button-container">
          <button className="chat-room-exit-button" onClick={handleLeave}>
            나가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
