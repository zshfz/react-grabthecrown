import "../styles/Login.scss";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const API = import.meta.env.VITE_API_URL;

  const { login } = useContext(AuthContext);

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API}/auth/login`, {
        userName,
        password,
      });

      login(res.data.user, res.data.token);
      navigate("/lobby");
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  return (
    <div className="login">
      <h2 className="login-h2">로그인</h2>
      <h6 className="login-h6">지금 바로 게임시작!</h6>
      <input
        className="login-nickname"
        type="text"
        placeholder="닉네임"
        value={userName}
        onChange={(e) => {
          setUserName(e.target.value);
        }}
      />
      <input
        className="login-password"
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      <button className="login-button" onClick={handleLogin}>
        로그인
      </button>
    </div>
  );
};

export default Login;
