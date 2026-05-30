# WITH-U Industrial Safety Monitoring System

## 1. 프로젝트 개요

WITH-U는 작업자 상태를 실시간으로 모니터링하고 위험을 감지해 사고 로그를 기록하며, 대시보드로 즉시 전송하는 산업 안전 관제 시스템입니다.

- 작업자 상태 실시간 모니터링
- 위험 감지
- 사고 기록 로그 관리
- 실시간 대시보드 전송

## 2. 전체 시스템 구조

Arduino 센서
→ MQTT Broker
→ Node.js Backend
→ MongoDB Atlas 저장
→ Socket.IO 실시간 전송
→ React Dashboard

역할 설명:
- Arduino 센서: 작업자 상태 데이터를 수집해 MQTT로 전송
- MQTT Broker: 센서 데이터를 안정적으로 중계
- Node.js Backend: 수신 데이터 처리, 상태/사고 로그 저장 및 이벤트 전송
- MongoDB Atlas: 작업자 상태 및 사고 로그 영구 저장
- Socket.IO: 프론트 대시보드에 실시간 데이터 스트리밍
- React Dashboard: 실시간 상태 및 사고 로그 시각화

## 3. 폴더 구조 설명

```txt
mqtt/
├── socket/
├── routes/
├── controllers/
├── services/
├── models/
├── utils/
├── logs/
└── server.js
```

- mqtt/: MQTT 수신 및 처리 로직
- socket/: Socket.IO 연결 및 이벤트 처리
- routes/: REST API 라우터
- controllers/: REST API 컨트롤러 (입출력 처리)
- services/: 비즈니스 로직 및 DB 접근
- models/: Mongoose 스키마
- utils/: 공용 유틸 함수
- logs/: 로그 파일 저장 공간
- server.js: 서버 엔트리 포인트

## 4. Worker 데이터 구조 명세

예시 JSON:

```json
{
  "workerId": 1,
  "workerName": "김철수",
  "status": "danger",
  "location": "A구역",
  "lastMovement": "방금 전",
  "incidentCount": 0
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| workerId | Number | 작업자 고유 ID |
| workerName | String | 작업자 이름 |
| status | String | 작업자 상태 (enum) |
| location | String | 현재 위치 |
| lastMovement | String | 마지막 움직임 시간 표시 |
| incidentCount | Number | 누적 사고 횟수 |

## 5. status enum 명세

현재 상태 enum:
- normal
- warning
- danger

| 상태 | 의미 | 프론트 색상 |
| --- | --- | --- |
| normal | 정상 상태 | 초록 |
| warning | 확인 필요 | 노랑 |
| danger | 위험 상태 | 빨강 |

IMPORTANT:
- Arduino 측은 반드시 이 enum 값만 MQTT로 전송해야 함
- Backend는 enum 기반으로 처리함
- Frontend는 enum 기준으로 UI 색상 처리함

## 6. MQTT 통신 명세 (아두이노용)

### MQTT Topic

```txt
with-u/alerts/fall
```

### Arduino → Backend MQTT JSON 형식

```json
{
  "workerId": 1,
  "workerName": "김철수",
  "status": "normal",
  "location": "B구역",
  "incidentCount": 1
}
```

필수 필드:
- workerId: 작업자 ID
- workerName: 작업자 이름
- status: 상태 enum 값
- location: 위치
- incidentCount: 누적 사고 횟수

IMPORTANT:
- status 값은 enum만 허용
- JSON 형식 오류 시 서버 처리 실패 가능
- UTF-8 JSON 기준

## 7. 사고 로그 시스템 설명

Backend는 MQTT로 danger 상태가 수신되면 사고 로그를 자동으로 생성하고 MongoDB에 저장합니다.

예시 로그:

```txt
14:21 김OO - B구역 쓰러짐 감지
14:22 관리자 확인 대기
14:23 작업자 호출 신호 전송
14:25 현장 대응팀 이동 중
14:27 B구역 작업자 전원 정상
```

## 8. Incident Log 데이터 구조

예시 JSON:

```json
{
  "time": "오후 2:21",
  "workerId": 1,
  "workerName": "김철수",
  "message": "B구역 쓰러짐 감지",
  "type": "danger"
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| time | String | 로그 생성 시각 (표시용) |
| workerId | Number | 작업자 ID |
| workerName | String | 작업자 이름 |
| message | String | 사고 메시지 |
| type | String | 사고 유형 (status enum 기반) |

## 9. Socket.IO 이벤트 명세 (프론트용)

이벤트 목록:
- worker-update
- incident-logs

### worker-update payload 예시

```json
[
  {
    "workerId": 1,
    "workerName": "김철수",
    "status": "normal",
    "location": "A구역",
    "lastMovement": "방금 전",
    "incidentCount": 0
  }
]
```

### incident-logs payload 예시

```json
[
  {
    "time": "14:21",
    "workerId": 1,
    "workerName": "김철수",
    "message": "B구역 쓰러짐 감지",
    "type": "danger"
  }
]
```

## 10. React Socket.IO 연동 예제

```jsx
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default function Dashboard() {
  const [workers, setWorkers] = useState([]);
  const [incidentLogs, setIncidentLogs] = useState([]);

  useEffect(() => {
    socket.on("worker-update", (payload) => {
      setWorkers(payload);
    });

    socket.on("incident-logs", (payload) => {
      setIncidentLogs(payload);
    });

    return () => {
      socket.off("worker-update");
      socket.off("incident-logs");
    };
  }, []);

  return (
    <div>
      <h2>Workers</h2>
      <pre>{JSON.stringify(workers, null, 2)}</pre>
      <h2>Incident Logs</h2>
      <pre>{JSON.stringify(incidentLogs, null, 2)}</pre>
    </div>
  );
}
```

## 11. MongoDB Atlas 설명

MongoDB Atlas를 사용하는 이유:
- 클라우드 관리형 DB로 운영 부담 최소화
- 실시간 프로젝트에 적합한 확장성 제공
- Node.js와 연동이 쉬움
- 자동 확장으로 트래픽 증가 대응 가능

## 12. 환경변수 설정

```env
PORT=4000
MONGO_URI=your_mongodb_uri
MQTT_BROKER_URL=mqtt://broker.emqx.io:1883
```

- PORT: 서버 포트
- MONGO_URI: MongoDB Atlas 연결 문자열
- MQTT_BROKER_URL: MQTT 브로커 주소

## 13. 실행 방법

```bash
npm install
npm run dev
```

## 14. 현재 구현 완료 기능 체크리스트

- [x] MQTT Broker 연결
- [x] MongoDB Atlas 연동
- [x] 작업자 상태 저장
- [x] 사고 로그 저장
- [x] Socket.IO 실시간 전송
- [x] 상태 enum 시스템
- [x] 실시간 대시보드 데이터 송신

## REST API 명세

### GET /api/workers

설명: 현재 작업자 상태 목록 조회

응답 예시:

```json
{
  "success": true,
  "data": [
    {
      "workerId": 1,
      "workerName": "김철수",
      "status": "normal",
      "location": "A구역",
      "lastMovement": "방금 전",
      "incidentCount": 0
    }
  ]
}
```

### GET /api/incidents

설명: 사고 로그 목록 조회

응답 예시:

```json
{
  "success": true,
  "data": [
    {
      "time": "14:21",
      "workerId": 1,
      "workerName": "김철수",
      "message": "B구역 쓰러짐 감지",
      "type": "danger"
    }
  ]
}
```
