import React from "react";
import { ScrollPanel } from "primereact/scrollpanel";
import { Avatar } from "primereact/avatar";
import { Badge } from "primereact/badge";
import { Button } from "primereact/button";

export function ChatListComponent({
  handleNewChatBtnClick,
  handleSelectChatBtnClick,
  handleRenameChatClick,
  handleDeleteChatBtnClick,
  conversations,
  activeConvId,
}) {
  return (
    <div className="flex flex-column w-full h-full">
      <div className="p-3 border-bottom-1 surface-border">
        <Button
          label="New Chat"
          icon="pi pi-plus"
          className="w-full"
          onClick={() => handleNewChatBtnClick()}
        />
      </div>
      <ScrollPanel style={{ width: "100%", height: "calc(100% - 60px)" }}>
        <div className="flex flex-column w-full">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`flex flex-row align-items-center p-3 cursor-pointer ${
                conv.id === activeConvId ? "bg-blue-100" : ""
              }`}
              onClick={() => handleSelectChatBtnClick(conv.id)}
            >
              <Avatar
                label={conv.name.charAt(0)}
                className="mr-3"
                shape="circle"
              />
              <div className="flex flex-column flex-grow-1">
                <div className="font-bold">{conv.name}</div>
                <div className="text-sm text-500 truncate">
                  {conv.lastMessage?.slice(0, 10)}
                </div>
              </div>
              <div className="flex flex-row align-items-center">
                {conv.id === activeConvId && (
                  <Badge value="Active" severity="info" className="mr-2" />
                )}
                <Button
                  icon="pi pi-pencil"
                  className="p-button-text p-button-secondary p-button-sm mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newName = prompt("Enter new name:", conv.name);
                    if (newName && newName.trim()) {
                      handleRenameChatClick(conv.id, newName.trim());
                    }
                  }}
                />
                <Button
                  icon="pi pi-trash"
                  className="p-button-text p-button-danger p-button-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChatBtnClick(conv.id);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </ScrollPanel>
    </div>
  );
}
