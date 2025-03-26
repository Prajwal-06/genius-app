"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DrizzleChat } from "@/lib/db/schema";
import MobileSidebarDoctutor from "../MobileSidebarDoctutor";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  isPro: boolean;
};

export default function ChatSideBar({ chats, chatId, isPro }: Props) {
  console.log("chat id in chat sidebar",chatId)


  
    return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      {/* New Chat Button */}
      
      <Link href="/" className="mb-4">
        <Button className="w-full border-dashed border-white border">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </Link>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/doctutor/${chat.id}`} >
            <div
              className={cn(
                "rounded-lg p-3 text-slate-300 flex items-center mb-2",
                {
                  "bg-blue-600 text-white": chat.id === chatId,
                  "hover:bg-white/10": chat.id !== chatId,
                }
              )}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              <p className="text-sm truncate">{chat.pdfName}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pro Upgrade Section */}
      <div className="mt-4 p-2 bg-white/10 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">Upgrade to Pro</span>
          <Button size="sm">
            Upgrade
          </Button>
        </div>
      </div>
    </div>
  );
}