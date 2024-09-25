const mqtt = require('mqtt');

const options = {
  clientId: 'mqttx_fae732cf',
  username: 'admin',
  password: 'admin',
  clean: true,
};

const brokerUrl = 'mqtt://broker.emqx.io';
const client = mqtt.connect(brokerUrl, options);

client.on('error', (err) => {
  console.error('publish error', err);
});

function publishData(data) {
  const topic = 'chatMessage';
  client.publish(topic, JSON.stringify(data), (err) => {
    if (err) {
      console.error('publish error', err);
    } else {
      console.log('data published successfully to topic', topic);
    }
  });
}

module.exports = { publishData };