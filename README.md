# Sharedb with react

# Usando múltiplos computadores para acessar o editor

* Altere o arquivo socket.js (frontend/src/utils/socket.js), remova o “localhost” e coloque o ip da maquina que estará hospedando o server (backend/server.js). 

![socket.js](https://paper-attachments.dropbox.com/s_8EEACA02764B226EC71E0B18F79A3B1B8CB9CF079A23249F8AB61A2E8EE8F074_1557171248216_socket.js.png)

* Altere o arquivo Editor.jsx (frontend/src/components/Editor.jsx), remova o “localhost” e coloque o ip da maquina que estará hospedando o server (backend/server.js).

    //...
    this.socket  = new W3CWebSocket('ws://localhost:8081') //linha 47
    //...
    this.socket = new W3CWebSocket('ws://localhost:8081'); //linha 57