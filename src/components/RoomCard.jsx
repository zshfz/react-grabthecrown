import "../styles/RoomCard.scss";

const RoomCard = (props) => {
  return (
    <div className="room-card">
      <div className="room-card-left">#{props.a.roomId}</div>
      <div className="room-card-center">방장: {props.a.masterId}</div>
      <div className="room-card-right">
        {props.a.waitingPlayer}/{props.a.totalPlayer}
      </div>
    </div>
  );
};

export default RoomCard;
