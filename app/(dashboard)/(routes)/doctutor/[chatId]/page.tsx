
// "use client";
// import axios from "axios";
// import * as z from "zod";
// import React, { useState } from "react";
// import Heading from "@/components/Heading";
// import { Book, MessageSquare } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { formSchema } from "../constants";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";
// import { Empty } from "@/components/Empty";
// import { Loader } from "@/components/Loader";
// import Dropdown from "react-bootstrap/Dropdown";
// import ReactMarkdown from "react-markdown";
// import FileUpload from "@/components/FileUpload";
// import { chats } from "@/lib/db/schema"
// import {auth} from "@clerk/nextjs"
// import { db } from "@/lib/db"
// import {eq} from "drizzle-orm"
// import { redirect } from "next/navigation";

// interface Message {
//   role: string;
//   content: string;
// }

// interface geminimsg {
//   content : string;
// }

// type Props = {
//   params:{
//     chatId: string;
//   }
// }

// const ConversationPage = async ({ params : { chatId }}) => {
//   const router = useRouter();
//   const [messages , setMessages] = useState<Message[]>([]);
//   const [selectedModel, setSelectedModel] = useState("OpenAI"); 
  
//   const { userId } = await auth();

//   const _chats= await db.select().from(chats).where(eq(chats.userId, userId))

//   if (!_chats) {
//     return redirect("/");
//   }
//   if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
//     return redirect("/");
//   }

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       promt: "",
//     },
//   });

//   const isLoading = form.formState.isSubmitting;

//   const onSubmit = async (values: z.infer<typeof formSchema>) => {
//     try {
//       const userMessage: Message = {
//         role: "user",
//         content: values.promt,
//       };

//       const newMessages = [...messages, userMessage ]
//       let endpoint = "OpenAI"
//          if (selectedModel === "OpenAI"){
//           console.log(selectedModel)
//           endpoint = "/api/conversation/openai"
//         } else if(selectedModel === "GeminiAI"){
//           console.log(selectedModel)
//           endpoint = "/api/conversation/geminai"
//         } else if(selectedModel === "deepseek-r1"){
//           console.log(selectedModel)
//           endpoint = "/api/conversation/deepseek-r1"
//         } else if(selectedModel === "deepseek-v3"){
//           console.log(selectedModel)
//           endpoint = "/api/conversation/deepseek-v3"
//         } else if(selectedModel === "Meta-Llama-3.3-70B-Instruct-Turbo"){
//           console.log(selectedModel)
//           endpoint = "/api/conversation/Meta-Llama-3.3-70B-Instruct-Turbo"
//         } 
    

//       const response = await axios.post(endpoint, {messages: newMessages});

//       setMessages((current) => [...current ,  userMessage , response.data ]);


//       form.reset();
//     } catch (error: any) {
//       console.error(error);
//     } finally {
//       router.refresh();
//     }
//   };



//   return (
//     <div>
//       <Heading
//         title="Doctutor"
//         description="Our most advanced chat to pdf model"
//         icon={Book}
//         iconColor="text-violet-500"
//         bgColor="bg-violet-500/10"
//       />
//       <div className="px-4 lg:px-8">
//         <div>
//           <Form {...form}>
//             <form
//               onSubmit={form.handleSubmit(onSubmit)}
//               className="rounded-lg border w-full p-2 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
//             >
//               <FormField
//                 name="promt"
//                 render={({ field }) => (
//                   <FormItem className="col-span-12 lg:col-span-8">
//                     <FormControl className="m-0 p-0">
//                       <Input
//                         className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
//                         disabled={isLoading}
//                         placeholder="Explain machine learning"
//                         {...field}
//                         autoComplete="off"
//                       />
//                     </FormControl>
//                   </FormItem>
//                 )}
//               />
//               <div className="col-span-12 lg:col-span-2">
//                 <select
//                   id="dropdown"
//                   name="dropdown"
//                   className="w-full border rounded-lg p-2"
//                   value={selectedModel} 
//                   onChange={(e) => setSelectedModel(e.target.value)}
//                 >
//                   <option value="OpenAI">OpenAI</option>
//                   <option value="GeminiAI">GeminiAI</option>
//                   <option value="deepseek-r1">Deepseek-R1</option>
//                   <option value="Meta-Llama-3.3-70B-Instruct-Turbo">Meta Llama-3.3 Turbo</option>
//                 </select>
//               </div>
//               <Button
//                 className="col-span-12 lg:col-span-2"
//                 disabled={isLoading}
//               >
//                 Generate
//               </Button>
//             </form>
//           </Form>

//           <FileUpload />

//         </div>
//         <div className="space-y-4 mt-4">
//           {isLoading && (
//             <div className="p-8 rounded-lg w-full flex item-center justify-center bg-muted">
//               <Loader />
//             </div>
//           )}
//           {
//               messages.length === 0 && !isLoading && (
//                 <Empty label="No Conversation started." />
//               )
//             }
//           <div className="flex flex-col-reverse gap-y-4">
//             {messages.reduce((acc: JSX.Element[], message, index) => {
   
//             if (index % 2 === 0) {
//               const response = messages[index + 1];
//               acc.push(
//                 <div key={message.content} className="space-y-1">
//                   <div className="inline-block bg-slate-100 px-2 py-1 rounded-full">
//                     {message.content}
//                   </div>
//                   {response && (
//                 <ReactMarkdown components={{
//                         pre: ({node, ...props}) =>(
//                           <div className="overflow-auto w-full my-2 bg-black text-white p-2 rounded-lg relative">
//                             {/* <button
//                               className="absolute top-2 right-2 text-sm bg-gray-200 text-black px-2 py-1 rounded"
//                               onClick={() => copyToClipboard(response.content)}
//                               >
//                               {copied}
//                           </button> */}
//                             <pre {...props}/>
//                           </div>
//                         ),
//                         code: ({node , ...props}) =>(
//                           <code className="bg-black text-white rounded-lg p-0.5" {...props}/>
//                         )
//                       }} className="bg-black/10 p-3 rounded-lg" >
//                         {
//                           response.content || ""
//                         }
//                       </ReactMarkdown>
                      
//                     )
//                   }
//         </div>
//       );
//     }
//     return acc;
//             }, [])}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ConversationPage;




"use client";
import ChatLoader from "@/components/ChatLoader";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChatSideBar from "@/components/chat/ChatSideBar";
import ChatComponent from "@/components/chat/ChatComponent";
import PDFViewer from "@/components/chat/PDFViewer";
import FileUpload from "@/components/FileUpload";
import { DrizzleChat } from "@/lib/db/schema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader } from "@/components/Loader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import MobileSidebarDoctutor from "@/components/MobileSidebarDoctutor";

export default function ConversationPage({
  params,
}: {
  params: { chatId: string };
}) {
  const id = params.chatId; // ✅ Extract chatId from params first

  
  
  const { user } = useUser();
  const router = useRouter();
  const [pdfUrl, setPdfUrl] = useState("");



  
  const { data: chats, isLoading: chatsLoading } = useQuery({
    queryKey: ["chats" , params.chatId],
    
    queryFn: async () => {
      
      const response = await axios.get(`/api/get-chats`);
     
      console.log(response)
      return response.data as DrizzleChat[];
    },
  });

  const { data: chat, isLoading: chatLoading } = useQuery({
    queryKey: ["chat", params.chatId],
    queryFn: async () => {
      
      const chatId = Array.isArray(params.chatId) 
        ? params.chatId[0] 
        : params.chatId;
  
      
      if (!chatId || isNaN(parseInt(chatId))) {
        throw new Error("Invalid chat ID");
      }
      
  
      const response = await axios.get(`/api/get-chats?chatId=${chatId}`);
      const chatData = response.data as DrizzleChat;
      setPdfUrl(chatData.pdfUrl);
      return chatData;
    },
    enabled: !!params.chatId 
  });

  if (!user || chatsLoading || chatLoading) {
    return <ChatLoader/>;
  }

  return (
    <ErrorBoundary>
      <div className="w-full h-screen overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar - Fixed width */}
          <div className="w-64 border-r flex-shrink-0">
            <div>
            <MobileSidebarDoctutor/>
            </div>
            <div className="p-4 h-full flex flex-col">
              <FileUpload />
              {chats ? (
                <ChatSideBar
                  chats={chats}
                  chatId={parseInt(params.chatId)}
                  isPro={false}
                />
              ) : (
                <Loader />
              )}
            </div>
          </div>
  
          {/* Main Content - Horizontal split */}
          <div className="flex-1 flex min-w-0">
            {/* PDF Viewer - Fixed 50% width */}
            <div className="w-1/2 border-r overflow-auto">
              {pdfUrl && <PDFViewer pdf_url={pdfUrl} />}
            </div>
            
            {/* Chat Component - Fixed 50% width */}
            <div className="w-1/2 overflow-hidden">
              <ChatComponent chatId={parseInt(params.chatId)} />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
  
}