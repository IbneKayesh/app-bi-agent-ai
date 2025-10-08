// src/ChatWindow.jsx
import React, { useState } from "react";
import { Button } from "primereact/button";
import DataTableDisplay from "./components/DataTableDisplay";
import { askQuery, sendFeedback } from "./services/api";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

export default function ChatWindow() {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const submitQuery = async () => {
    if (!query.trim()) return;

    const userMsg = { sender: "user", text: query };
    setChatHistory([...chatHistory, userMsg]);
    setLoading(true);

    try {

      console.log("Submitting query:", query);

      const res = await askQuery(query);
      const agentMsg = {
        sender: "agent",
        ...res,
      };
      setChatHistory((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [
        ...prev,
        { sender: "agent", text: "Error fetching data from server." },
      ]);
    } finally {
      setLoading(false);
    }

    //setQuery("");
  };

  const handleFeedback = async (row, like) => {
    if (!row.query_id) return;
    try {
      await sendFeedback(row.query_id, like ? "like" : "dislike");
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  return (
    <div className="p-m-4">
      {/* Input */}
      <div className="p-field p-grid">
        <div className="p-col-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about sales..."
            className="p-inputtext p-component p-inputtext-lg p-d-block"
            onKeyDown={(e) => e.key === "Enter" && submitQuery()}
          />
        </div>
        <div className="p-col-2">
          <Button label="Send" onClick={submitQuery} loading={loading} />
        </div>
      </div>

      {/* Chat history */}
      <div className="chat-history p-mt-4">
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            className={`p-mb-3 ${
              msg.sender === "user" ? "p-text-right" : "p-text-left"
            }`}
          >
            {msg.sender === "agent" ? (
              <>
                <div>
                  <b>SQL:</b> <code>{msg.SQL_Query}</code>
                </div>
                <div>
                  <b>Summary:</b> {msg.Response_Summary}
                </div>
                <div>
                  <b>Suggestion:</b> {msg.Suggestion}
                </div>
                <DataTableDisplay data={msg.results} />
                {msg.query_id && (
                  <div className="p-mt-2">
                    <Button
                      icon="pi pi-thumbs-up"
                      className="p-button-success p-mr-2"
                      onClick={() => handleFeedback(msg, true)}
                    />
                    <Button
                      icon="pi pi-thumbs-down"
                      className="p-button-danger"
                      onClick={() => handleFeedback(msg, false)}
                    />
                  </div>
                )}
              </>
            ) : (
              <div>{msg.text}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
