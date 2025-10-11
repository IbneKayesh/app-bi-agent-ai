import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { ProgressSpinner } from "primereact/progressspinner";
import { Dropdown } from "primereact/dropdown";
import { UserAvatarDropdown } from "./UserAvatarDropdown";

export function ChatUIComponent({
  modelOptions,
  selectedModel,
  setSelectedModel,
  inputValue,
  setInputValue,
  handleKeyDownEvent,
  handleSendMessageBtnClick,
  conversation,
  nextTurn,
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation?.messages]);

  if (!conversation) {
    return (
      <div className="flex flex-grow-1 align-items-center justify-content-center">
        <span className="text-500">Select a conversation</span>
      </div>
    );
  }

  return (
    <div className="flex flex-column w-full h-full">
      <div className="flex align-items-center justify-content-between p-3 border-bottom-1 surface-border font-bold">
        <div className="flex align-items-center">
          <Avatar
            label={conversation.name.charAt(0)}
            shape="circle"
            className="mr-2"
          />
          <span>{conversation.name}</span>
        </div>
        <UserAvatarDropdown />
      </div>

      <div
        className="flex flex-column flex-grow-1 p-3 overflow-auto"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        {conversation.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-column mb-4 ${
              msg.from === "User" ? "align-items-end" : "align-items-start"
            }`}
          >
            <div
              className={`p-3 shadow-2 border-round-xl ${
                msg.from === "User"
                  ? "bg-primary text-white border-primary"
                  : "bg-purple-400 text-white border-gray-300"
              }`}
              style={{ maxWidth: "75%", minWidth: "200px" }}
            >
              <div className="text-sm">
                {msg.from === "System" ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
            <div
              className={`flex align-items-center mt-1 ${
                msg.from === "User"
                  ? "justify-content-end"
                  : "justify-content-start"
              }`}
            >
              <span
                className={`text-xs text-500 ${
                  msg.from === "User" ? "mr-2" : "ml-2"
                }`}
              >
                Rule: {msg.model} | Time:
                {msg.timestamp.toLocaleTimeString()}
              </span>
              {msg.from === "User" && (
                <span
                  className={`text-xs ${
                    msg.status === "sent" ? "text-500" : "text-primary"
                  }`}
                >
                  {msg.status === "sent"
                    ? "✓"
                    : msg.status === "read"
                    ? "✓✓"
                    : ""}
                </span>
              )}
            </div>
          </div>
        ))}
        {nextTurn === "system" && (
          <div className="flex flex-column mb-4 align-items-start">
            <div
              className="p-3 shadow-2 border-round-xl bg-surface-50 border-surface-200"
              style={{ maxWidth: "75%", minWidth: "200px" }}
            >
              <div className="flex align-items-center">
                <ProgressSpinner
                  style={{ width: "18px", height: "18px" }}
                  strokeWidth="3"
                  fill="#ffffff"
                />
                <span className="ml-2 text-sm text-surface-600">Thinking</span>
                <div className="ml-2">
                  <span className="text-xs text-surface-400">.</span>
                  <span className="text-xs text-surface-400">.</span>
                  <span className="text-xs text-surface-400">.</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex align-items-center p-3 border-top-1 surface-border">
        <Dropdown
          value={selectedModel}
          options={modelOptions}
          onChange={(e) => setSelectedModel(e.value)}
          placeholder="Select Model"
          className="mr-2"
          style={{ width: "220px" }}
        />
        <InputText
          className="flex-grow-1 mr-2"
          placeholder={
            nextTurn === "user"
              ? "Type your message..."
              : "Waiting for system..."
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDownEvent}
          disabled={nextTurn !== "user"}
        />
        <Button
          icon="pi pi-send"
          label="Send"
          onClick={handleSendMessageBtnClick}
          disabled={nextTurn !== "user"}
        />
      </div>
    </div>
  );
}
