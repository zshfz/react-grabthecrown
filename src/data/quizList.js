const quizList = [
  {
    QID: 1,
    ROUND: 1,
    QUESTION: "HTTP 상태 코드 404는 어떤 의미인가요?",
    OPTIONS: [
      { CHOICE: "성공", IS_CORRECT: false },
      { CHOICE: "리다이렉션", IS_CORRECT: false },
      { CHOICE: "클라이언트 오류", IS_CORRECT: true },
      { CHOICE: "서버 오류", IS_CORRECT: false },
      { CHOICE: "권한 없음", IS_CORRECT: false },
    ],
  },
  {
    QID: 2,
    ROUND: 2,
    QUESTION: "'===' 연산자는 무엇을 비교하나요?",
    OPTIONS: [
      { CHOICE: "값만 비교", IS_CORRECT: false },
      { CHOICE: "참조만 비교", IS_CORRECT: false },
      { CHOICE: "타입만 비교", IS_CORRECT: false },
      { CHOICE: "타입과 값 모두 비교", IS_CORRECT: true },
      { CHOICE: "문자열 길이 비교", IS_CORRECT: false },
    ],
  },
  {
    QID: 3,
    ROUND: 3,
    QUESTION: "컴퓨터의 RAM 역할로 적절한 것은?",
    OPTIONS: [
      { CHOICE: "프로세서 제작", IS_CORRECT: false },
      { CHOICE: "데이터의 영구 저장", IS_CORRECT: false },
      { CHOICE: "빠른 임시 저장", IS_CORRECT: true },
      { CHOICE: "그래픽 출력", IS_CORRECT: false },
      { CHOICE: "네트워크 송수신", IS_CORRECT: false },
    ],
  },
  {
    QID: 4,
    ROUND: 4,
    QUESTION: "다음 중 SQL의 데이터 조회 명령어는?",
    OPTIONS: [
      { CHOICE: "DELETE", IS_CORRECT: false },
      { CHOICE: "INSERT", IS_CORRECT: false },
      { CHOICE: "SELECT", IS_CORRECT: true },
      { CHOICE: "DROP", IS_CORRECT: false },
      { CHOICE: "ALTER", IS_CORRECT: false },
    ],
  },
  {
    QID: 5,
    ROUND: 5,
    QUESTION: "OSI 7계층 중 4계층(전송 계층)의 주요 프로토콜은?",
    OPTIONS: [
      { CHOICE: "IP", IS_CORRECT: false },
      { CHOICE: "FTP", IS_CORRECT: false },
      { CHOICE: "TCP", IS_CORRECT: true },
      { CHOICE: "HTTP", IS_CORRECT: false },
      { CHOICE: "DNS", IS_CORRECT: false },
    ],
  },
];

export default quizList;
