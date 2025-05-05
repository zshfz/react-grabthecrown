import { useState, useEffect } from "react";
import UserCard from "../components/UserCard";
import "../styles/ChatRoom.scss";
import quizList from "../data/quizList";
import gameRoom from "../data/gameRoom";

const ChatRoom = () => {
  const QUIZ_TIME = 20;

  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [isGameStart, setIsGameStart] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState("");
  const currentQuiz = quizList[currentIndex];

  useEffect(() => {
    if (!isGameStart) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer); // 시간 다 되면 멈춤
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // 컴포넌트 바뀔 때 정리
  }, [isGameStart]);

  return (
    <div className="chat-room">
      <div className="chat-room-left">
        <div className="chat-room-left-top">
          {isGameStart ? (
            <>
              <div className="chat-room-timer-container">
                <p className="chat-room-time-left">남은 시간: {timeLeft}초</p>
                <div
                  className="chat-room-timer"
                  style={{ width: `${(timeLeft / QUIZ_TIME) * 100}%` }}
                />
              </div>
              <div className="chat-room-progress">
                <h1>1 라운드</h1>
                <p>남은 문제</p>
                <p>
                  [{currentIndex + 1} / {quizList.length}]
                </p>
              </div>
              <div className="chat-room-divider" />
              <div className="chat-room-quiz-container">
                <h1 className="chat-room-quiz-question">
                  Q. {currentQuiz.QUESTION}
                </h1>
                <ul className="chat-room-quiz-choice-container">
                  {currentQuiz.OPTIONS.map((a, i) => {
                    return (
                      <li
                        className={
                          selectedChoice === i
                            ? "selected"
                            : "chat-room-quiz-choice"
                        }
                        onClick={() => setSelectedChoice(i)}
                      >
                        {i + 1}. {a.CHOICE}
                      </li>
                    );
                  })}
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
          {gameRoom.map((a) => {
            return <UserCard key={a.GID} a={a} />;
          })}
        </div>
      </div>
      <div className="chat-room-right">
        <div className="chat-room-chat-area">
          <h4 className="chat-room-chat-area-header">채팅 목록</h4>
        </div>
        <div className="chat-room-input-container">
          <textarea
            className="chat-room-textarea"
            type="text"
            placeholder="메시지를 입력하세요."
          />
          <button className="chat-room-button">전송</button>
        </div>
        <div className="start-exit-button-container">
          <button
            className="chat-room-start-button"
            onClick={() => {
              setIsGameStart(true);
            }}
          >
            게임시작
          </button>
          <button className="chat-room-exit-button">나가기</button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
