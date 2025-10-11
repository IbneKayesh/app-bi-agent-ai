import ollama from "ollama";
import React, { useState, useEffect, useRef } from "react";
const apiUrl = import.meta.env.VITE_OLLAMA_API;

const useChatBox = () => {
  //Chat List
  const [conversations, setConversations] = useState([
    {
      id: "1",
      name: "New Chat 1",
      lastMessage: "",
      messages: [],
    },
  ]);

  const [activeConvId, setActiveConvId] = useState(null);
  const [nextTurn, setNextTurn] = useState("user");
  const activeConversation = conversations.find((c) => c.id === activeConvId);

  // Database schema
  const [schema, setSchema] = useState(null);

  useEffect(() => {
    fetch("/database-schema.json")
      .then((res) => res.json())
      .then(setSchema)
      .catch((err) => console.error("Failed to load schema:", err));
  }, []);

  // Chat UI
  const [selectedModel, setSelectedModel] = useState("GEM3");
  const modelOptions = [
    { label: "Gemma3:1b", value: "GEM3" },
    { label: "SQL Generator", value: "SQLG" },
    { label: "Procurement Planner (Demo)", value: "Procurement Planner" },
  ];

  const [inputValue, setInputValue] = useState("");

  //Chat List Actions
  const handleNewChatBtnClick = () => {
    const newConv = {
      id: `${Date.now()}`,
      name: `New Chat ${conversations.length + 1}`,
      lastMessage: "",
      messages: [],
    };
    setConversations((prev) => [...prev, newConv]);
    setActiveConvId(newConv.id);
    setNextTurn("user");
  };

  const handleSelectChatBtnClick = (convId) => {
    console.log("Selected Conv ID:", convId);
    setActiveConvId(convId);
    setNextTurn("user");
  };

  const handleRenameChatClick = (convId, newName) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === convId ? { ...conv, name: newName } : conv
      )
    );
  };

  const handleDeleteChatBtnClick = (convId) => {
    if (conversations.length <= 1) return; // Prevent deleting the last conversation
    setConversations((prev) => prev.filter((conv) => conv.id !== convId));
    if (activeConvId === convId) {
      const remaining = conversations.filter((conv) => conv.id !== convId);
      setActiveConvId(remaining[0]?.id || null);
    }
  };

  //Chat UI Actions
  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    sendUserMessage(trimmed);
    setInputValue("");
  };

  const handleKeyDownEvent = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSendMessageBtnClick = () => {
    handleSend();
  };

  const sendUserMessage = (text) => {
    if (!activeConversation || nextTurn !== "user") return;

    const userMsg = {
      id: `u-${Date.now()}`,
      from: "User",
      text,
      timestamp: new Date(),
      status: "sent",
      model: selectedModel,
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConvId
          ? {
              ...conv,
              messages: [...conv.messages, userMsg],
              lastMessage: text,
            }
          : conv
      )
    );
    setNextTurn("system");
  };

  const sendSystemReply = (text) => {
    if (!activeConversation || nextTurn !== "system") return;

    const sysMsg = {
      id: `s-${Date.now()}`,
      from: "System",
      text,
      timestamp: new Date(),
      status: "read",
      model: selectedModel,
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConvId
          ? {
              ...conv,
              messages: [...conv.messages, sysMsg],
              lastMessage: text,
            }
          : conv
      )
    );
    setNextTurn("user");
  };

  // Backend integration
  useEffect(() => {
    if (nextTurn === "system") {
      const toReply = activeConversation?.lastMessage;
      const fetchResponse = async () => {
        try {
          const response = await sendMessageToBackend(toReply);
          console.log("Backend response:", response);
          sendSystemReply(response);
        } catch (error) {
          console.error("Error sending message to backend:", error);
          sendSystemReply("Sorry, there was an error processing your request.");
        }
      };
      fetchResponse();
    }
  }, [nextTurn, activeConversation]);

  //backend integration can be done here
  const sendMessageToBackend_Ollama_Chat = async (message) => {
    const response = await ollama.chat({
      model: "gemma3:1b",
      messages: [
        {
          role: "user",
          content: "What color is the sky?",
        },
      ],
    });

    console.log(response.message.content);

    return response.message.content;
  };

  async function sendMessageToBackend_Ollama_Generate(prompt) {
    try {
      const response = await ollama.generate({
        model: "gemma3:1b", // Replace with your desired model
        prompt: prompt,
      });
      console.log(response); // The generated text
      return response.response;
    } catch (error) {
      console.error("Error generating response:", error);
    }
  }

  const sendMessageToBackend_gemma3 = async (message) => {
    try {
      const res = await fetch("http://192.168.61.207:11434/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemma3:1b",
          messages: [
            {
              role: "system",
              content:
                "You are an AI assistant that provides specific answers based on information from the local database. Always refer to the local database for accurate and detailed responses.",
            },
            {
              role: "user",
              content: message,
            },
          ],
          stream: false,
        }),
      });

      //console.log("Raw response:", res);

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Backend returned error ${res.status}:`, errorText);
        throw new Error("Failed to get response from backend.");
      }

      const data = await res.json();
      console.log("Response:", data.message.content);
      return data.message.content;
    } catch (err) {
      console.error("Error in sendMessageToBackend:", err);
      return "Something went wrong.";
    }
  };

  const sendMessageToBackend_SQL = async (message) => {
    if (!schema) {
      return "Database schema not loaded yet. Please try again.";
    }

    try {
      const res = await fetch("http://192.168.61.207:11434/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemma3:1b",
          messages: [
            {
              role: "system",
              content: `You are an AI that generates valid SQL queries based strictly on the given database schema. The database is Oracle 21c.

Your rules:
1. Only respond with a valid SQL query based on the schema below.
2. If the user's question is unrelated to the database or cannot be answered using the schema, reply exactly with: "I’m not aware to answer it."
3. Do not provide any explanation, context, or extra text—just the SQL or the fixed message.

Schema:
${JSON.stringify(schema, null, 2)}`,
            },
            {
              role: "user",
              content: message,
            },
          ],
          stream: false,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Backend returned error ${res.status}:`, errorText);
        throw new Error("Failed to get response from backend.");
      }

      const data = await res.json();
      console.log("Response:", data.message.content);
      return data.message.content;
    } catch (err) {
      console.error("Error in sendMessageToBackend:", err);
      return "Something went wrong.";
    }
  };

  const sendMessageToBackend = async (message) => {
    console.log("Selected Model:", selectedModel);

    
    if (selectedModel === "GEM3") {
      return await sendMessageToBackend_gemma3(message);
    }
    if (selectedModel === "SQLG") {
      return await sendMessageToBackend_SQL(message);
    }
  };

  return {
    //Chat List
    handleNewChatBtnClick,
    handleSelectChatBtnClick,
    handleRenameChatClick,
    handleDeleteChatBtnClick,
    conversations,
    activeConversation,

    //Chat UI
    modelOptions,
    selectedModel,
    setSelectedModel,
    inputValue,
    setInputValue,
    handleKeyDownEvent,
    handleSendMessageBtnClick,
    nextTurn,
  };
};

export default useChatBox;
