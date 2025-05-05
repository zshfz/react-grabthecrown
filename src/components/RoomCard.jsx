import "../styles/RoomCard.scss";

const RoomCard = (props) => {
  return (
    <div className="room-card">
      <div className="room-card-left">#{props.a.GID}</div>
      <div className="room-card-center">방장: {props.a.USERNAME}</div>
      <div className="room-card-right">
        {props.a.TOTAL_PLAYER}/{props.a.MAX_PLAYERS}
      </div>
    </div>
  );
};

export default RoomCard;
