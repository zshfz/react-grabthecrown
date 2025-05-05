const gameRoom = [
  {
    GID: 1,
    MASTER_UID: 101,
    IS_ACTIVE: false,
    TOTAL_PLAYER: 2,
    MAX_PLAYERS: 3,
    WAITING_PLAYER: 0,
    USERNAME: "alice",
    GAME_SCORE: 20,
  },
  {
    GID: 2,
    MASTER_UID: 102,
    IS_ACTIVE: true,
    TOTAL_PLAYER: 4,
    MAX_PLAYERS: 6,
    WAITING_PLAYER: 1,
    USERNAME: "fiona",
    GAME_SCORE: 30,
  },
  {
    GID: 3,
    MASTER_UID: 103,
    IS_ACTIVE: true,
    TOTAL_PLAYER: 3,
    MAX_PLAYERS: 5,
    WAITING_PLAYER: 0,
    USERNAME: "diana",
    GAME_SCORE: 10,
  },
];

export default gameRoom;
