// src/pages/ChatRoom.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../socket";
import UserCard from "../components/UserCard";
import "../styles/ChatRoom.scss";
import quizList from "../data/quizList"; // 임시 데이터
import gameRoom from "../data/gameRoom"; // 임시 데이터

const ChatRoom = () => {
  const QUIZ_TIME = 20;
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [isGameStart, setIsGameStart] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState("");
  const currentQuiz = quizList[currentIndex];

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

  // ① 나가기 버튼 핸들러
  const handleLeave = () => {
    socket.emit("leave_room", { roomId: Number(roomId) });
    navigate("/lobby");
  };

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
              게임 시작 버튼을 눌러 게임을 시작하세요!
            </h4>
          )}
        </div>
        <div className="chat-room-left-bottom">
          {/* 임시 유저 리스트 */}
          {gameRoom.map((u) => (
            <UserCard key={u.GID} a={u} />
          ))}
        </div>
      </div>

      <div className="chat-room-right">
        <div className="chat-room-chat-area">
          <h4 className="chat-room-chat-area-header">채팅 목록</h4>
        </div>
        <div className="chat-room-input-container">
          <textarea
            className="chat-room-textarea"
            placeholder="메시지를 입력하세요."
          />
          <button className="chat-room-button">전송</button>
        </div>
        <div className="start-exit-button-container">
          <button
            className="chat-room-start-button"
            onClick={() => setIsGameStart(true)}
          >
            게임시작
          </button>
          <button className="chat-room-exit-button" onClick={handleLeave}>
            나가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
