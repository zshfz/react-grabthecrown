import "../styles/Register.scss";
import { useState } from "react";
import axios from "axios";

const Register = () => {
  const API = import.meta.env.VITE_API_URL;

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [previewUrl, setPreviewUrl] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setProfileImage(file);
  };

  const handleRegister = async () => {
    if (password != rePassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("userName", userName);
    formData.append("password", password);
    if (profileImage) {
      formData.append("profile_Img", profileImage);
    }

    try {
      await axios.post(`${API}/auth/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("회원가입 성공!");
      setUserName("");
      setPassword("");
      setRePassword("");
      setProfileImage("");
      setPreviewUrl("");
    } catch (err) {
      alert(err.response.data.message);
      setUserName("");
      setPassword("");
      setRePassword("");
      setProfileImage("");
      setPreviewUrl("");
    }
  };

  return (
    <div className="register">
      <h2 className="register-h2">회원가입</h2>
      <h6 className="register-h6">계정이 없으신가요?</h6>
      <div className="register-input-container">
        <div className="register-input-container-left">
          <input
            className="register-nickname"
            type="text"
            placeholder="닉네임"
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
            }}
          />
          <input
            className="register-password"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="register-input-container-right">
          <label>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="preview"
                className="register-profile"
              />
            ) : (
              <div className="register-placeholder">이미지 선택</div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
          </label>
        </div>
      </div>
      <input
        className="register-re-password"
        type="password"
        placeholder="비밀번호 재입력"
        value={rePassword}
        onChange={(e) => {
          setRePassword(e.target.value);
        }}
      />
      <button className="register-button" onClick={handleRegister}>
        회원가입
      </button>
    </div>
  );
};

export default Register;
