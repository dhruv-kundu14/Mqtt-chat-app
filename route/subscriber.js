const mqtt = require('mqtt');

const options = {
  clientId: 'mqttx_fae732cf',
  username: 'admin',
  password: 'admin',
  clean: true,
};

const brokerUrl = 'mqtt://broker.emqx.io';
const client = mqtt.connect(brokerUrl, options);

client.on('connect', () => {
  console.log('subscriber connected to mqtt broker ');

  const topic = 'chatMessage';
  client.subscribe(topic, (err) => {
    if (err) {
      console.error('error message from topic: ', err);
    } else {
      console.log('Subscribed to topic:', topic);
    }
  });
});

client.on('message', (topic, message) => {
  console.log('Received message from topic:', topic);
  console.log('Message:', message.toString());
});

// Handle error
client.on('error', (err) => {
  console.error('Subscriber error:', err);
});

module.exports = { client };