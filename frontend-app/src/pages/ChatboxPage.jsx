import React, { useState, useEffect, useRef } from "react";
import { ChatListComponent } from "./ChatListComponent";
import { ChatUIComponent } from "./ChatUIComponent";

//internal imports
import useChatBox from "../hooks/useChatBox";

const ChatboxPage = () => {
  const {
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
  } = useChatBox();

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-right-1 surface-border">
        <ChatListComponent
          handleNewChatBtnClick={handleNewChatBtnClick}
          handleSelectChatBtnClick={handleSelectChatBtnClick}
          handleDeleteChatBtnClick={handleDeleteChatBtnClick}
          conversations={conversations}
          activeConvId={activeConversation?.id}
          handleRenameChatClick={handleRenameChatClick}
        />
      </div>
      <div className="flex-grow-1">
        <ChatUIComponent
          modelOptions={modelOptions}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleKeyDownEvent={handleKeyDownEvent}
          handleSendMessageBtnClick={handleSendMessageBtnClick}
          conversation={activeConversation}
          nextTurn={nextTurn}
        />
      </div>
    </div>
  );
};
export default ChatboxPage;
