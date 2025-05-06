import "../styles/ModalComponent.scss";
import { useState } from "react";

const ModalComponent = (props) => {
  const [playerCount, setPlayerCount] = useState("");

  return (
    <div className="modal-component">
      <div className="modal-header">
        <h3>방 만들기</h3>
      </div>
      <div className="modal-body">
        <label className="modal-body-title">
          <img className="triangle-icon" src="/triangleIcon.png" />
          인원 수
        </label>
        <div className="modal-body-dropdown">
          <input
            className="modal-body-input"
            list="player-counts"
            placeholder="인원 수 선택"
            value={playerCount}
            onChange={(e) => setPlayerCount(e.target.value)}
          />
          <datalist id="player-counts">
            <option value="2" />
            <option value="3" />
            <option value="4" />
            <option value="5" />
            <option value="6" />
          </datalist>
        </div>
      </div>
      <div className="modal-footer">
        <button
          className="modal-footer-button"
          onClick={() => {
            const count = Number(playerCount);
            if (count < 2 || count > 6) {
              alert("인원 수는 2명 이상 6명 이하로 선택해주세요.");
              return;
            }
            props.onCreate(count);
          }}
        >
          생성
        </button>
        <button className="modal-footer-button" onClick={props.onClose}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default ModalComponent;
