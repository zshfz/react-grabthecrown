import RoomCard from "../components/RoomCard";
import "../styles/Lobby.scss";
import ModalComponent from "../components/ModalComponent";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import socket from "../socket";

const Lobby = () => {
  const API = import.meta.env.VITE_API_URL;

  const { user, logout } = useContext(AuthContext);

  const [showModal, setShowModal] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    socket.on("room_created", (roomInfo) => {
      // 리스트에 새 방 추가
      setRooms((prev) => [...prev, roomInfo]);
      navigate(`/chat-room/${roomInfo.roomId}`);
    });

    socket.on("room_state_update", (updatedRoom) => {
      setRooms((prev) => {
        const exists = prev.find((r) => r.roomId === updatedRoom.roomId);
        return exists
          ? prev.map((r) => (r.roomId === updatedRoom.roomId ? updatedRoom : r))
          : [...prev, updatedRoom];
      });
    });

    socket.on("joined_room", ({ roomId }) => {
      console.log("🎯 방 입장 성공:", roomId);
      navigate(`/chat-room/${roomId}`);
    });

    // 방 삭제 알림 오면 리스트에서 제거
    socket.on("room_deleted", ({ roomId }) => {
      setRooms((prev) => prev.filter((r) => r.roomId !== roomId));
    });

    return () => {
      socket.off("room_created");
      socket.off("room_state_update");
      socket.off("joined_room");
      socket.off("room_deleted");
    };
  }, [navigate]);

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
  }, [API]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`${API}/gameroom`);
        setRooms(res.data);
      } catch (err) {
        console.error("방 목록 조회 실패:", err);
      }
    };
    fetchRooms();
    const id = setInterval(fetchRooms, 3000);
    return () => clearInterval(id);
  }, [API]);

  useEffect(() => {
    const fetchConnectedUsers = async () => {
      try {
        const res = await axios.get(`${API}/connected_users`);
        setConnectedUsers(res.data.connectedUsers);
      } catch (err) {
        console.error("접속자 목록 조회 실패:", err);
      }
    };

    fetchConnectedUsers();

    // 3초마다 polling
    const intervalId = setInterval(fetchConnectedUsers, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const handleCreateRoom = (totalPlayer) => {
    console.log("🟨 생성 버튼 클릭됨", totalPlayer); // 디버깅 로그
    socket.emit("create_room", { totalPlayer });
    setShowModal(false);
  };

  const handleJoinRoom = (room) => {
    const { roomId, waitingPlayer, totalPlayer, isActive } = room;

    if (isActive) {
      alert("이미 게임이 시작된 방입니다.");
      return;
    }
    if (waitingPlayer >= totalPlayer) {
      alert("이미 인원수가 가득 찬 방입니다.");
      return;
    }

    // 조건 통과하면 소켓 입장
    socket.emit("join_room", { roomId });
  };

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
            <h5 className="lobby-h5">접속자 목록</h5>
            <ul className="lobby-users-list">
              {connectedUsers.map((a) => {
                return (
                  <li className="lobby-users-list-li" key={a.userId}>
                    <img
                      className="lobby-users-list-center-image"
                      src={`${API}${a.profileImg}`}
                    />
                    {a.userName}
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
          <div className="lobby-room-list-container">
            {rooms.map((a) => {
              return (
                <div
                  className="lobby-room-list"
                  key={a.roomId}
                  onClick={() => {
                    handleJoinRoom(a);
                  }}
                >
                  <RoomCard a={a} />
                </div>
              );
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
            onCreate={handleCreateRoom}
          />
        </div>
      )}
    </>
  );
};

export default Lobby;
