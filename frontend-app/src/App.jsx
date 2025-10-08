import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import ChatWindow from "./ChatWindow";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <h2 className="p-text-center p-mt-3">SQL Agent Chat</h2>
        <ChatWindow />
      </div>
    </>
  );
}

export default App;
