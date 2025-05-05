import "../styles/Background.scss";

const Background = () => {
  const crownCount = 30;

  const generateRandomStyles = () => {
    return Array.from({ length: crownCount }).map(() => {
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = 4 + Math.random() * 3;
      const rangeX = 30 + Math.random() * 50;
      const rangeY = 30 + Math.random() * 50;

      return {
        top: `${top}%`,
        left: `${left}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        "--rangeX": `${rangeX}px`,
        "--rangeY": `${rangeY}px`,
      };
    });
  };

  const crownStyles = generateRandomStyles();

  return (
    <div className="background">
      {crownStyles.map((style, i) => (
        <img
          key={i}
          src="/crownIcon.png"
          className="crown"
          style={style}
          alt="crown"
        />
      ))}
    </div>
  );
};

export default Background;
