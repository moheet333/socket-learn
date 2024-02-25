import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";
import { Container, Button, TextField, Typography, Stack } from "@mui/material";

function App() {
  const socket = useMemo(
    () =>
      io("http://localhost:5000/", {
        withCredentials: true,
      }),
    []
  );

  const [message, setMessage] = useState("");
  const [socketId, setSocketId] = useState("");
  const [room, setRoom] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomName, setRoomName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("message", { message, room });
    setMessage("");
    setRoom("");
  };

  const handleGroupSubmit = (e) => {
    e.preventDefault();
    socket.emit("join-room", roomName);
    setRoomName("");
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
      setSocketId(socket.id);
      console.log(`Socket ID : ${socket.id}`);
    });

    socket.on("welcome", (data) => {
      console.log(data);
    });

    socket.on("new-user", (data) => {
      console.log(data);
    });

    socket.on("receive-message", (data) => {
      console.log(data);
      setMessages((prev) => [...prev, data]);
    });
  }, []);

  return (
    <div>
      <Container>
        <form onSubmit={handleGroupSubmit}>
          <TextField
            label="Enter your group name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" type="submit">
            Join
          </Button>
        </form>
        <Typography variant="h5" align="center" gutterBottom>
          Chat Application
        </Typography>
        <Typography variant="h5" align="center" gutterBottom>
          {socketId && `Socket ID : ${socketId}`}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Enter your room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Enter your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" type="submit">
            Send
          </Button>
        </form>
        <Stack>
          {messages.map((msg, i) => (
            <Typography key={i} variant="h6" align="center" gutterBottom>
              {msg.message}
            </Typography>
          ))}
        </Stack>
      </Container>
    </div>
  );
}

export default App;
