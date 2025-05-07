import "../styles/UserCard.scss";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const UserCard = (props) => {
  const API = import.meta.env.VITE_API_URL;
  const { user: currentUser } = useContext(AuthContext);

  return (
    <div
      className={
        props.a.userName === currentUser?.userName
          ? "user-card-highlight"
          : "user-card"
      }
    >
      <img className="user-card-image" src={`${API}${props.a.profileImg}`} />
      <h4>{props.a.userName}</h4>
      <h5 className="user-card-score">{props.a.gameScore ?? 0}</h5>
    </div>
  );
};

export default UserCard;
