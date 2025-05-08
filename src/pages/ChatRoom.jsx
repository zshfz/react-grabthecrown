// src/pages/ChatRoom.jsx
import { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "../socket";
import UserCard from "../components/UserCard";
import "../styles/ChatRoom.scss";
import { AuthContext } from "../context/AuthContext";

const ChatRoom = () => {
  const QUIZ_TIME = 5;
  const { id: roomId } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [isComposing, setIsComposing] = useState(false); //엔터키로 채팅 쳣을 때 뒤에 한글자 또 입력되는거 방지
  const [players, setPlayers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [isGameStart, setIsGameStart] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [chatMessage, setChatMessage] = useState([]); //수신된 메시지 목록
  const [inputMessage, setInputMessage] = useState(""); //사용자가 입력중인 메시지
  const [countdown, setCountdown] = useState(null); //백엔드에서 보내준 시간 초
  const [currentRound, setCurrentRound] = useState(null); //현재 라운드
  const [questionNumber, setQuestionNumber] = useState(null); //현재 문제 수
  const [hasSubmitted, setHasSubmitted] = useState(false); //문제당 답안 제출 했냐?
  const [questionText, setQuestionText] = useState(null);
  const [nextRound, setNextRound] = useState(null); //라운다 마다의 텀 동안 보여줄 메시지 관리 state
  const [options, setOptions] = useState([]);

  const chatEndRef = useRef(null); //채팅창 스크롤 자동으로 내려가도록

  //UserCard 점수 바로바로 반영되도록
  // ChatRoom.jsx 안, 다른 useEffect 훅들 아래에 추가
  useEffect(() => {
    const onScoreUpdated = ({ userId, score }) => {
      setPlayers((prev) =>
        prev.map((p) =>
          p.userId === userId
            ? { ...p, gameScore: score } // gameScore 속성 추가/갱신
            : p
        )
      );
    };
    socket.on("score_updated", onScoreUpdated);
    return () => socket.off("score_updated", onScoreUpdated);
  }, []);

  //게임 시작 이벤트 받기
  useEffect(() => {
    const onGameStarted = () => {
      setIsGameStart(true);
    };
    socket.on("game_started", onGameStarted);
    return () => {
      socket.off("game_started", onGameStarted);
    };
  }, []);

  //백엔드에서 보내준 시간 초
  useEffect(() => {
    const onCountdown = ({ seconds }) => {
      if (seconds <= 0) {
        setCountdown(null);
      } else {
        setCountdown(seconds);
      }
    };
    socket.on("countdown", onCountdown);
    return () => {
      socket.off("countdown", onCountdown);
    };
  }, []);

  useEffect(() => {
    const handleAboutToDelete = ({ message }) => {
      setChatMessage((prev) => [
        ...prev,
        { userId: null, userName: "SYSTEM", message },
      ]);
    };
    socket.on("room_about_to_delete", handleAboutToDelete);
    return () => {
      socket.off("room_about_to_delete", handleAboutToDelete);
    };
  }, [roomId]);

  useEffect(() => {
    const onNewQuestion = ({ round, number, text, options: opts }) => {
      setCurrentRound(round); // 🧭 라운드
      setQuestionNumber(number); // 📄 문제 순번
      setQuestionText(text);
      setOptions(opts);
      setCountdown(null);
      setTimeLeft(QUIZ_TIME);
      setSelectedChoice(null);
      setHasSubmitted(false);
    };
    socket.on("new_question", onNewQuestion);
    return () => socket.off("new_question", onNewQuestion);
  }, []);

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

  // 퀴즈 타이머 (문제마다 재실행)
  useEffect(() => {
    if (!isGameStart || questionText == null) return;
    setTimeLeft(QUIZ_TIME); // 새 문제마다 20초 재설정
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? clearInterval(timer) || 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameStart, questionText]);

  // ② 서버가 강제종료(game_forced_end) 또는 정상종료(game_finished) 알리면
  useEffect(() => {
    const handleForcedEnd = ({ message }) => {
      // 1) 채팅창에 SYSTEM 메시지로 띄우기
      setChatMessage((prev) => [
        ...prev,
        { userId: null, userName: "SYSTEM", message },
      ]);
      // 2) 잠깐 텀 준 뒤 로비로 이동
      setTimeout(() => navigate("/lobby"), 1000);
    };
    socket.on("game_forced_end", handleForcedEnd);
    return () => {
      socket.off("game_forced_end", handleForcedEnd);
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
    // 1) 일반 채팅 메시지
    const handleIncoming = ({ userId, userName, message }) => {
      setChatMessage((prev) => [...prev, { userId, userName, message }]);
    };

    // 2) 금칙어 차단 메시지 → SYSTEM으로 표시
    const handleBlocked = ({ message }) => {
      setChatMessage((prev) => [
        ...prev,
        { userId: null, userName: "SYSTEM", message },
      ]);
    };

    socket.on("chat_message", handleIncoming);
    socket.on("chat_blocked", handleBlocked);

    return () => {
      socket.off("chat_message", handleIncoming);
      socket.off("chat_blocked", handleBlocked);
    };
  }, []);

  // 2) 기존 채팅 & 금칙어 이벤트 훅 아래에 추가
  // ChatRoom.jsx
  useEffect(() => {
    const handleGameEvent = ({ message }) => {
      console.log("🏷️ [game_event] received:", message);
      setChatMessage((prev) => [
        ...prev,
        { userId: null, userName: "SYSTEM", message },
      ]);
    };
    socket.on("game_event", handleGameEvent);
    return () => {
      socket.off("game_event", handleGameEvent);
    };
  }, []);

  //라운드 마다 텀
  useEffect(() => {
    const handleRoundStarted = ({ round }) => {
      setNextRound(round); // ➕ 라운드 번호 저장
      setTimeout(() => setNextRound(null), 5000); // 5초 뒤 메시지 숨김
    };
    socket.on("round_started", handleRoundStarted);
    return () => {
      socket.off("round_started", handleRoundStarted);
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

  // ② Enter 처리 수정
  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !isComposing // ← 조합 중이면 무시
    ) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCompositionStart = () => setIsComposing(true); //채팅 뒤에 한글자 또 쳐지는거 방지
  const handleCompositionEnd = () => setIsComposing(false); //채팅 뒤에 한글자 또 쳐지는거 방지

  //답안 제출 핸들러
  const handleSubmitAnswer = () => {
    if (selectedChoice === null) {
      return alert("답을 선택해주세요.");
    }
    socket.emit("submit_answer", {
      roomId: Number(roomId),
      answerIndex: selectedChoice,
    });
    setHasSubmitted(true);
  };

  return (
    <div className="chat-room">
      <div className="chat-room-left">
        <div className="chat-room-left-top">
          {countdown != null ? (
            <h2 className="chat-room-countdown">
              {countdown}초 뒤 게임이 시작됩니다!
            </h2>
          ) : nextRound != null ? (
            <h2 className="chat-room-countdown">
              곧 {nextRound}라운드가 시작됩니다!
            </h2>
          ) : isGameStart ? (
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
                🧭 라운드 {currentRound} • 📄 문제 {questionNumber}
              </div>
              <div className="chat-room-divider" />
              {/* 퀴즈 문항 */}
              <div className="chat-room-quiz-container">
                <h1 className="chat-room-quiz-question">Q. {questionText}</h1>
                <ul className="chat-room-quiz-choice-container">
                  {options.map((opt, i) => (
                    <li
                      key={i}
                      className={
                        selectedChoice === i
                          ? "selected"
                          : "chat-room-quiz-choice"
                      }
                      onClick={() => setSelectedChoice(i)}
                    >
                      {i + 1}. {opt}
                    </li>
                  ))}
                </ul>
                <div className="chat-room-quiz-submit">
                  <button
                    className="chat-room-quiz-submit-button"
                    onClick={handleSubmitAnswer}
                    disabled={hasSubmitted}
                    style={{ opacity: hasSubmitted ? 0.5 : 1 }}
                  >
                    {hasSubmitted ? "제출 완료" : "제출"}
                  </button>
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
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onKeyDown={handleKeyDown}
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
