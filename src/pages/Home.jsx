import Login from "../components/Login";
import Register from "../components/Register";
import "../styles/Home.scss";

const Home = () => {
  return (
    <div className="home">
      <div className="home-top">
        <img className="home-banner" src="/banner.png" alt="banner" />
      </div>
      <div className="home-bottom">
        <Login />
        <div className="home-divider"></div>
        <Register />
      </div>
    </div>
  );
};

export default Home;
