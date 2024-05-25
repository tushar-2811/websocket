
import { useEffect, useState } from "react"

type Message = {
    message : string;
    sendBy : string
}

function App() {
  const [socket, setSocket] = useState<null | WebSocket>(null);
  const [Messages, setMessages] = useState<Message[]>([]);

  const [data, setData] = useState("");
  const [room, setRoom] = useState("");

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("Connected");
      setSocket(socket);
    }

    socket.onmessage = (message) => {
      const DataFromServer = JSON.parse(message.data);
      console.log(`Recieved message ${DataFromServer}`);
      const mess = DataFromServer.payload.message;
      const sender = DataFromServer.payload.sendBy;
      setMessages((prevMessages) => prevMessages ? [...prevMessages , {message : mess , sendBy : sender}] : [{message : mess , sendBy : sender}]);
    }

    return () => {
      socket.close();
    }
  }, [])

  const sendMessage = () => {
    try {
      const Payload = {
        "type" : "message",
        "payload": {
           "message" : data.toString()
        }
      }
      socket?.send(JSON.stringify(Payload));
      setData("");
    } catch (error) {
      console.log(error);
      return;
    }
  }

  const joinRoom = () => {
    try {
      const data = {
        "type" : "join",
        "payload": {
           "roomId" : room.toString()
        }
      }
      socket?.send(JSON.stringify(data));
      
    } catch (error) {
      console.log("error while joining room" , error)
    } finally{
      
    }
  }

  if (!socket) {
    return <div>
      connecting to socket server.....
    </div>
  }

  return (
    <>
      <header className='text-green-400 bg-black w-full h-16 flex justify-between items-center px-8'>
        <h1>Room No - {room}</h1>

        <div className="m-4" >
        <input type="text" className="px-4 py-2 border-2 m-2" value={room} onChange={(e) => setRoom(e.target.value)} />
        <button className="px-4 py-2 border-2 rounded-md" onClick={joinRoom}>
          Join a Room
        </button>
      </div>
       </header>

      <div className="m-4">
        <input type="text" className="px-4 py-2 border-2 my-2" value={data} onChange={(e) => setData(e.target.value)} />

        <button className="px-4 py-2 border-2 rounded-md" onClick={sendMessage}>
          Send
        </button>
      </div>

      
   
    

      

           {Messages && Messages.map((msg, index) => (
          <div  className="text-red-500 text-xl my-4" key={index}>Send by: {msg.sendBy} : {msg.message}</div>
        ))}

      
    </>
  )
}

export default App
