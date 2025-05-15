const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const users = [
  {
    user_id: "test",
    user_password: "1234",
    user_name: "테스트 유저",
    user_info: "테스트 유저입니다",
  },
];

const app = express();

app.use(
  cors({
    origin: [
      "http://127.0.0.1:3000", // 실제 포트 번호로 수정
      "http://localhost:3000", // 실제 포트 번호로 수정
    ],
    methods: ["OPTIONS", "POST", "GET", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

const secretKey = "ozcodingschool"; // 비밀 키

// 클라이언트에서 POST 요청을 받은 경우
app.post("/", (req, res) => {
  const { userId, userPassword } = req.body;
  const userInfo = users.find(
    (el) => el.user_id === userId && el.user_password === userPassword
  );

  // 유저 정보가 없는 경우
  if (!userInfo) {
    return res.status(401).send("로그인 실패");
  } else {
    // 1. 유저 정보가 있는 경우 accessToken을 발급하는 로직
    const accessToken = jwt.sign({ user_id: userInfo.user_id }, secretKey, {
      expiresIn: "1h", // 토큰 유효기간 설정
    });

    // 2. 응답으로 accessToken을 클라이언트로 전송
    res.send({ accessToken });
  }
});

// 클라이언트에서 GET 요청을 받은 경우
app.get("/", (req, res) => {
  // 3. req headers에 담겨 있는 accessToken을 검증하는 로직
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer 토큰 형식에서 토큰 추출
  if (!token) {
    return res.status(401).send("토큰이 없습니다");
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.log(err); // 오류 로그 추가
      return res.status(403).send("토큰 검증 실패");
    }

    // 4. 검증이 완료되면 유저 정보를 클라이언트로 전송
    const userInfo = users.find((el) => el.user_id === user.user_id);
    res.send(userInfo);
  });
});

app.listen(3000, () => console.log("서버 실행!"));

