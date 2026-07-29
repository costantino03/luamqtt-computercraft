const WebSocket = require('ws');
const net = require('net');

// Configurazione
const WS_PORT = 8084; // La porta a cui si connetterà ComputerCraft
const MQTT_HOST = '192.168.2.3';
const MQTT_PORT = 1883; // La porta TCP nativa di Mosquitto

const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', (ws) => {
    console.log('🟢 ComputerCraft connesso al Bridge!');
    
    // Apre una connessione TCP verso Mosquitto
    const mqttTCP = net.createConnection(MQTT_PORT, MQTT_HOST, () => {
        console.log('   🔗 Ponte stabilito verso Mosquitto (1883)');
    });

    // Inoltra i dati da WebSocket a TCP
    ws.on('message', (msg) => {
        mqttTCP.write(msg);
    });

    // Inoltra i dati da TCP a WebSocket
    mqttTCP.on('data', (data) => {
        ws.send(data);
    });

    // Gestione disconnessioni
    ws.on('close', () => {
        console.log('🔴 ComputerCraft disconnesso.');
        mqttTCP.end();
    });
    mqttTCP.on('close', () => ws.close());
    mqttTCP.on('error', (err) => console.error('Errore TCP:', err.message));
});

console.log(`🚀 Bridge WebSocket-to-TCP in ascolto sulla porta ${WS_PORT}...`);