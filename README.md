# WITH-U Industrial Safety Monitoring System

WITH-U는 작업자 상태를 실시간으로 수집하고, 위험 감지와 사고 처리 흐름을 MongoDB와 Socket.IO로 관리하는 산업 안전 관제 시스템입니다.

## 1. 프로젝트 개요

- 작업자 상태 실시간 모니터링
- 위험 감지 및 사고 생성
- 관리자 액션 기반 사고 처리
- 작업자 호출 및 작업자 응답 처리
- 사고 타임라인 관리
- 실시간 대시보드 전송

## 2. 전체 시스템 구조

```txt
Arduino 센서
→ MQTT Broker
→ Node.js Backend
→ MongoDB Atlas 저장
→ Socket.IO 실시간 전송
→ React Dashboard
```

역할 설명:
- Arduino 센서: 작업자 상태를 MQTT로 전송
- MQTT Broker: 센서 메시지를 중계
- Node.js Backend: MQTT 수신, DB 저장, 사고 처리, Socket.IO 전송
- MongoDB Atlas: 작업자/사고/로그 데이터 영구 저장
- Socket.IO: 프론트 대시보드에 실시간 데이터 전송
- React Dashboard: 상태와 사고 타임라인 시각화

## 3. 폴더 구조 설명

```txt
WITH-U-SERVER/
├── mqtt/
├── socket/
├── routes/
├── controllers/
├── services/
├── models/
├── utils/
└── server.js
```

- mqtt/: MQTT 수신 및 처리 로직
- socket/: Socket.IO 연결 처리
- routes/: REST API 라우터
- controllers/: 요청/응답 처리
- services/: 비즈니스 로직 및 DB 접근
- models/: Mongoose 스키마
- utils/: 공용 유틸 및 enum
- server.js: 서버 엔트리 포인트

## 4. Worker 데이터 구조 명세

예시 JSON:

```json
{
  "workerId": 1,
  "workerName": "김철수",
  "status": "normal",
  "location": "A구역",
  "lastMovement": "방금 전",
  "incidentCount": 0,
  "callStatus": "idle",
  "lastCallAt": null,
  "lastResponseAt": null,
  "responseSeconds": null
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| workerId | Number | 작업자 고유 ID |
| workerName | String | 작업자 이름 |
| status | String | 작업자 상태 (`normal` / `warning` / `danger`) |
| location | String | 현재 위치 |
| lastMovement | String | 마지막 움직임 시간 표시 |
| incidentCount | Number | 누적 사고 횟수 |
| callStatus | String | 작업자 호출 응답 상태 (`idle` / `calling` / `responded`) |
| lastCallAt | Date | 최근 작업자 호출 시간 |
| lastResponseAt | Date | 최근 작업자 응답 시간 |
| responseSeconds | Number | 최근 호출부터 응답까지 걸린 시간(초) |

## 5. status enum 명세

현재 상태 enum:
- `normal`
- `warning`
- `danger`

| 상태 | 의미 | 프론트 색상 |
| --- | --- | --- |
| normal | 정상 상태 | 초록 |
| warning | 확인 필요 | 노랑 |
| danger | 위험 상태 | 빨강 |

IMPORTANT:
- Arduino 측은 반드시 이 enum 값만 MQTT로 전송해야 함
- Backend는 enum 기반으로 처리함
- Frontend는 enum 기준으로 UI 색상 처리함

### callStatus enum 명세

작업자 호출 응답 상태 enum:
- `idle`: 대기중
- `calling`: 호출 중
- `responded`: 응답 완료

## 6. MQTT 통신 명세 (아두이노용)

### MQTT Topic

```txt
with-u/workers/status
```

### Arduino → Backend MQTT JSON 형식

```json
{
  "workerId": 1,
  "workerName": "김철수",
  "status": "danger",
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

상태 처리 규칙:
- danger: 활성 Incident 없으면 신규 생성
- warning: 활성 Incident에 `관리자 확인 완료` 단계 추가
- normal: 활성 Incident를 resolved 처리

## 7. 사고(Incident) 시스템 설명

Backend는 MQTT로 `danger` 상태가 수신되면 새로운 Incident를 생성하고, 하나의 `incidentId`로 사고 처리 흐름을 관리합니다.

Incident 흐름:
- 사고 발생 (`detected`)
- 관리자 확인 완료 (`acknowledged`)
- 작업자 호출 (`calling_worker`)
- 작업자 응답 확인 (`worker_responded`)
- 대응팀 이동 (`dispatching_team`)
- 상황 종료 (`resolved`)

예시 로그:

```txt
14:21 쓰러짐 감지
14:22 관리자 확인 완료
14:23 작업자 호출 신호 전송
14:24 작업자 응답 확인
14:24 사고 자동 종료
```

## 8. Incident Log 데이터 구조

예시 JSON:

```json
{
  "incidentId": "6647f7b7e2d4e0a6c3a2b9f1",
  "workerId": 1,
  "workerName": "김철수",
  "step": "detected",
  "message": "B구역 쓰러짐 감지",
  "time": "오후 2:21"
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| incidentId | String | 사고 고유 ID |
| workerId | Number | 작업자 ID |
| workerName | String | 작업자 이름 |
| step | String | 단계 (`detected` / `acknowledged` / `calling_worker` / `worker_responded` / `dispatching_team` / `resolved`) |
| message | String | 사고 메시지 |
| time | String | 로그 생성 시각 (표시용) |

## 8-1. Incident 구조 설명

예시 JSON:

```json
{
  "incidentId": "6647f7b7e2d4e0a6c3a2b9f1",
  "workerId": 1,
  "workerName": "김철수",
  "location": "B구역",
  "currentStatus": "processing",
  "dangerLevel": "danger",
  "startedAt": "2026-05-30T05:21:00.000Z",
  "resolvedAt": null
}
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| incidentId | String | 사고 고유 ID |
| workerId | Number | 작업자 ID |
| workerName | String | 작업자 이름 |
| location | String | 발생 위치 |
| currentStatus | String | 사고 상태 (`active` / `processing` / `resolved`) |
| dangerLevel | String | 위험 등급 (`normal` / `warning` / `danger`) |
| startedAt | Date | 사고 발생 시각 |
| resolvedAt | Date | 상황 종료 시각 |

## 8-2. Incident 타임라인 예시

```txt
14:21 detected - 쓰러짐 감지
14:22 acknowledged - 관리자 확인 완료
14:23 calling_worker - 작업자 호출 신호 전송
14:24 worker_responded - 작업자 응답 확인
14:24 resolved - 사고 자동 종료
```

## 9. Socket.IO 이벤트 명세 (프론트용)

이벤트 목록:
- `workers:update`
- `incidents:active`
- `incidents:timeline`

### `workers:update` payload 예시

```json
[
  {
    "workerId": 1,
    "workerName": "김철수",
    "status": "normal",
    "location": "A구역",
    "lastMovement": "방금 전",
    "incidentCount": 0,
    "callStatus": "responded",
    "lastCallAt": "2026-06-10T05:21:00.000Z",
    "lastResponseAt": "2026-06-10T05:21:07.000Z",
    "responseSeconds": 7
  }
]
```

### `incidents:active` payload 예시

```json
[
  {
    "incidentId": "6647f7b7e2d4e0a6c3a2b9f1",
    "workerId": 1,
    "workerName": "김철수",
    "location": "B구역",
    "currentStatus": "processing",
    "dangerLevel": "danger",
    "startedAt": "2026-05-30T05:21:00.000Z",
    "resolvedAt": null
  }
]
```

### `incidents:timeline` payload 예시

```json
{
  "incidentId": "6647f7b7e2d4e0a6c3a2b9f1",
  "timeline": [
    {
      "incidentId": "6647f7b7e2d4e0a6c3a2b9f1",
      "workerId": 1,
      "workerName": "김철수",
      "step": "detected",
      "message": "B구역 쓰러짐 감지",
      "time": "14:21",
      "createdAt": "2026-05-30T05:21:00.000Z"
    }
  ]
}
```

## 10. React Socket.IO 연동 예제

```jsx
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

const callStatusLabel = {
  idle: "대기중",
  calling: "호출 중",
  responded: "응답 완료",
};

function formatCallStatus(worker) {
  const label = callStatusLabel[worker.callStatus] || "대기중";

  if (worker.callStatus === "responded" && worker.responseSeconds !== null) {
    return `${label} (${worker.responseSeconds}초)`;
  }

  return label;
}

export default function Dashboard() {
  const [workers, setWorkers] = useState([]);
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [incidentTimeline, setIncidentTimeline] = useState([]);

  useEffect(() => {
    socket.on("workers:update", (payload) => {
      setWorkers(payload);
    });

    socket.on("incidents:active", (payload) => {
      setActiveIncidents(payload);
    });

    socket.on("incidents:timeline", (payload) => {
      setIncidentTimeline(payload.timeline || []);
    });

    return () => {
      socket.off("workers:update");
      socket.off("incidents:active");
      socket.off("incidents:timeline");
    };
  }, []);

  return (
    <div>
      <h2>실시간 작업자 상세 현황</h2>
      <table>
        <thead>
          <tr>
            <th>이름</th>
            <th>상태</th>
            <th>위치</th>
            <th>최근 활동</th>
            <th>호출 응답 상태</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((worker) => (
            <tr key={worker.workerId}>
              <td>{worker.workerName}</td>
              <td>{worker.status}</td>
              <td>{worker.location}</td>
              <td>{worker.lastMovement}</td>
              <td>{formatCallStatus(worker)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Active Incidents</h2>
      <pre>{JSON.stringify(activeIncidents, null, 2)}</pre>
      <h2>Incident Timeline</h2>
      <pre>{JSON.stringify(incidentTimeline, null, 2)}</pre>
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
PORT=8000
MONGO_URI=your_mongodb_uri
MQTT_BROKER_URL=mqtt://broker.emqx.io:1883
PUBLIC_BASE_URL=http://localhost:8000
```

- PORT: 서버 포트
- MONGO_URI: MongoDB Atlas 연결 문자열
- MQTT_BROKER_URL: MQTT 브로커 주소
- PUBLIC_BASE_URL: Swagger 서버 표시용 URL

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
- [x] 관리자 액션 API
- [x] 작업자 응답 자동 종료
- [x] 작업자 호출 응답 상태 실시간 표시
- [x] Swagger UI 제공

## REST API 명세

### `GET /api/workers`

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
      "incidentCount": 0,
      "callStatus": "responded",
      "lastCallAt": "2026-06-10T05:21:00.000Z",
      "lastResponseAt": "2026-06-10T05:21:07.000Z",
      "responseSeconds": 7
    }
  ]
}
```

### `GET /api/workers/{workerId}/incidents`

설명: 작업자별 사고 이력과 각 사고의 타임라인을 함께 조회

응답 예시:

```json
{
  "success": true,
  "data": {
    "workerId": 1,
    "workerName": "김철수",
    "totalCount": 2,
    "incidents": [
      {
        "incidentId": "INC001",
        "status": "resolved",
        "location": "B구역",
        "createdAt": "2025-06-01T14:21:00Z",
        "resolvedAt": "2025-06-01T14:24:00Z",
        "duration": 180,
        "logs": [
          {
            "step": "detected",
            "message": "쓰러짐 감지",
            "createdAt": "2025-06-01T14:21:00Z"
          },
          {
            "step": "acknowledged",
            "message": "관리자 확인 완료",
            "createdAt": "2025-06-01T14:22:00Z"
          },
          {
            "step": "calling_worker",
            "message": "작업자 호출 신호 전송",
            "createdAt": "2025-06-01T14:23:00Z"
          },
          {
            "step": "worker_responded",
            "message": "작업자 응답 확인",
            "createdAt": "2025-06-01T14:24:00Z"
          },
          {
            "step": "resolved",
            "message": "사고 종료",
            "createdAt": "2025-06-01T14:24:00Z"
          }
        ]
      }
    ]
  }
}
```

### `GET /api/incidents`

설명: 활성 사고 목록 조회

응답 예시:

```json
{
  "success": true,
  "data": [
    {
      "incidentId": "6647f7b7e2d4e0a6c3a2b9f1",
      "workerId": 1,
      "workerName": "김철수",
      "location": "B구역",
      "currentStatus": "processing",
      "dangerLevel": "danger",
      "startedAt": "2026-05-30T05:21:00.000Z",
      "resolvedAt": null
    }
  ]
}
```

### `GET /api/incidents/active`

설명: 활성 사고 목록 조회 (별칭)

### `GET /api/incidents/{incidentId}/timeline`

설명: 사고 타임라인 조회

### `POST /api/incidents/{incidentId}/ack`

설명: 관리자 확인 완료 처리

### `POST /api/incidents/{incidentId}/call`

설명: 작업자 호출 신호 전송

### `POST /api/incidents/{incidentId}/dispatch`

설명: 현장 대응 처리

### `POST /api/incidents/{incidentId}/resolve`

설명: 상황 종료 처리

## MongoDB 컬렉션 구조

- `workers`: 작업자 상태
- `incidents`: 사고 메타데이터
- `incidentlogs`: 사고 타임라인 로그

## MQTT Topic

- `with-u/workers/status`
- `with-u/worker/call`
- `with-u/worker/response`

### `with-u/workers/status` 예시

```json
{
  "workerId": 1,
  "workerName": "김철수",
  "status": "danger",
  "location": "B구역",
  "incidentCount": 1
}
```

### `with-u/worker/call` 예시

```json
{
  "workerId": 1
}
```

관리자 호출 API는 MQTT publish 전에 해당 Worker를 아래 상태로 저장하고 `workers:update` 이벤트를 전송합니다.

```json
{
  "callStatus": "calling",
  "lastCallAt": "2026-06-10T05:21:00.000Z"
}
```

### `with-u/worker/response` 예시

```json
{
  "workerId": 1,
  "response": "safe"
}
```

서버가 `safe` 응답을 수신하면 해당 Worker를 아래 상태로 저장하고 `workers:update` 이벤트를 전송합니다. `responseSeconds`는 `(lastResponseAt - lastCallAt) / 1000` 기준으로 계산되어 `GET /api/workers`와 Socket payload에 포함됩니다.

```json
{
  "callStatus": "responded",
  "lastResponseAt": "2026-06-10T05:21:07.000Z",
  "responseSeconds": 7
}
```
