import RoomCard from "../components/RoomCard";
import "../styles/Lobby.scss";
import users from "../data/users"; //더미데이터
import gameRoom from "../data/gameRoom"; //더미데이터
import ModalComponent from "../components/ModalComponent";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Lobby = () => {
  const API = import.meta.env.VITE_API_URL;

  const { user, logout } = useContext(AuthContext);

  const [showModal, setShowModal] = useState(false);
  const [ranking, setRanking] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await axios.get(`${API}/ranking`);
        setRanking(res.data);
      } catch (err) {
        console.error(
          "랭킹 조회 실패:",
          err.response?.data?.message || err.message
        );
      }
    };

    fetchRanking();
  }, []);

  return (
    <>
      <div className="lobby">
        <div className="lobby-left">
          <div className="lobby-banner">
            <img
              className="lobby-banner-image"
              src="/banner.png"
              alt="banner"
            />
          </div>
          <div className="lobby-current-user">
            {user?.userName}님 환영합니다!
          </div>
          <div className="lobby-ranking">
            <h5 className="lobby-h5">랭킹</h5>
            <ul className="lobby-ranking-list">
              {ranking.map((a, i) => {
                return (
                  <li className="lobby-ranking-list-li" key={i}>
                    <div className="lobby-ranking-list-left">{i + 1}위</div>
                    <div className="lobby-ranking-list-center">
                      <img
                        className="lobby-ranking-list-center-image"
                        src={`${API}${a.PROFILE_IMG}`}
                      />
                      {a.USERNAME}
                    </div>
                    <div className="lobby-ranking-list-right">
                      👑X{a.CROWN_CNT}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="lobby-users">
            <h5 className="lobby-h5">대기방 접속자 목록</h5>
            <ul className="lobby-users-list">
              {users.map((a) => {
                return (
                  <li className="lobby-users-list-li" key={a.UID}>
                    <img
                      className="lobby-users-list-center-image"
                      src={a.PROFILE_IMG}
                    />
                    {a.USERNAME}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="lobby-button-container">
            <button
              className="lobby-make-button"
              onClick={() => setShowModal(true)}
            >
              방 만들기
            </button>
            <button
              className="lobby-logout-button"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              로그아웃
            </button>
          </div>
        </div>
        <div className="lobby-right">
          <h5 className="lobby-h5">방 목록</h5>
          <div className="lobby-room-list">
            {gameRoom.map((a) => {
              return <RoomCard key={a.GID} a={a} />;
            })}
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <ModalComponent
            onClose={() => {
              setShowModal(false);
            }}
          />
        </div>
      )}
    </>
  );
};

export default Lobby;
