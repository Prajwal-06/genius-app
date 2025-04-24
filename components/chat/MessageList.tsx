import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import { Loader2 } from "lucide-react";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  isLoading: boolean;
  messages: Message[];
};

const MessageList = ({ messages, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (!messages) return <></>;
  
  return (
    <div className="flex flex-col gap-2 px-4 py-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn("flex", {
            "justify-end pl-10": message.role === "user",
            "justify-start pr-10": message.role === "assistant",
          })}
        >
          <div
            className={cn(
              "rounded-lg px-3 text-sm py-1 shadow-md ring-1 ring-gray-900/10 break-words max-w-full",
              {
                "bg-blue-600 text-white": message.role === "user",
              }
            )}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }) {
                  const isUser = message.role === "user";
                  return (
                    <code
                      className={cn(
                        "rounded p-1 text-inherit",
                        isUser ? "bg-blue-700" : "bg-gray-200"
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre({ node, className, children, ...props }) {
                  const isUser = message.role === "user";
                  return (
                    <pre
                      className={cn(
                        "rounded-lg p-4 my-2 overflow-x-auto text-inherit",
                        isUser ? "bg-blue-700" : "bg-gray-100"
                      )}
                      {...props}
                    >
                      {children}
                    </pre>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;