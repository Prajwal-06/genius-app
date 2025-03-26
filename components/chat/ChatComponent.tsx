"use client";
import { useChat } from "ai/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import MessageList from "@/components/chat/MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";
import { useEffect } from "react";


type Props = { chatId: number };

export default function ChatComponent({ chatId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      if (!chatId || chatId <= 0) return [];
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
    enabled: !!chatId
  });
  

  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: { chatId },
  
    initialMessages: data || [],
  });

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="relative h-full overflow-hidden ">
      {/* Message List */}
      <div className=" h-[85.5%] overflow-y-auto " id="message-container">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="absolute bottom-0 w-full p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="flex-1 border-l-amber-700"
          />
          <Button type="submit" className="bg-blue-600">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

