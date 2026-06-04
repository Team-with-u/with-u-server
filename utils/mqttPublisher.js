const mqtt = require("mqtt");

let client;

function getClient() {
  if (!client) {
    client = mqtt.connect(process.env.MQTT_BROKER_URL);

    client.on("connect", () => {
      console.log("✅ MQTT publish 연결 성공");
    });

    client.on("error", (error) => {
      console.error("❌ MQTT publish 연결 실패");
      console.error(error);
    });
  }

  return client;
}

function publishMessage(topic, payload) {
  const mqttClient = getClient();

  return new Promise((resolve, reject) => {
    mqttClient.publish(topic, JSON.stringify(payload), (error) => {
      if (error) {
        return reject(error);
      }

      return resolve();
    });
  });
}

module.exports = {
  publishMessage,
};
