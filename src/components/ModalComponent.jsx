import "../styles/ModalComponent.scss";

const ModalComponent = (props) => {
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
          />
          <datalist id="player-counts">
            <option value="2명" />
            <option value="3명" />
            <option value="4명" />
            <option value="5명" />
            <option value="6명" />
          </datalist>
        </div>
      </div>
      <div className="modal-footer">
        <button className="modal-footer-button">생성</button>
        <button className="modal-footer-button" onClick={props.onClose}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default ModalComponent;
