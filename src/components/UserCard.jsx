import "../styles/UserCard.scss";

const UserCard = (props) => {
  const CURRENT_USER = "fiona";

  return (
    <div
      className={
        props.a.USERNAME === CURRENT_USER ? "user-card-highlight" : "user-card"
      }
    >
      <img className="user-card-image" src="/profileImage.jpg" />
      <h4>{props.a.USERNAME}</h4>
      <h5 className="user-card-score">{props.a.GAME_SCORE}</h5>
    </div>
  );
};

export default UserCard;
