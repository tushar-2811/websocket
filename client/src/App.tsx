import { useEffect, useState } from "react"


function App() {
  const [socket , setSocket] = useState<null | WebSocket>(null);
  const [latestMessages , setLatestMessages] = useState("");
  const [data , setData] = useState("");

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      console.log("Connected");
      setSocket(socket);
    }

    socket.onmessage = (message) => {
      console.log(`Recieved message ${message.data}`);
      setLatestMessages(message.data);
   }

   return () => {
    socket.close();
   }
} ,[])

  if(!socket){
    return <div>
      connecting to socket server.....
    </div>
  }

  return (
    <>
     <h1 className='text-green-400'>hello tushar</h1>

     <input type="text" className="px-4 py-2 border-2 my-2" value={data} onChange={(e) => setData(e.target.value)} />

     <button className="px-4 py-2 border-2 rounded-md" onClick={() => {socket.send(data)}}>
      Send
     </button>

     {
       <div className="text-red-500 text-xl my-4 ">
        {latestMessages}
       </div>
     }
    </>
  )
}

export default App
