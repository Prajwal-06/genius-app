// "use client";
// import axios from "axios";
// import * as z from "zod";
// import React, { useState } from "react";
// import Heading from "@/components/Heading";
// import { Code } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { formSchema } from "./constants";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";
// import { Empty } from "@/components/Empty";
// import { Loader } from "@/components/Loader";
// import ReactMarkdown from "react-markdown";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"; // Added for syntax highlighting
// import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"; // Added style for syntax highlighting

// interface Message {
//   role: string;
//   content: string;
// }

// const CodePage = () => {
//   const router = useRouter();
//   const [messages, setMessages] = useState<Message[]>([]);
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
//       const newMessages = [...messages, userMessage];

//       const response = await axios.post("/api/code", { messages: newMessages });

//       setMessages((current) => [...current, userMessage, response.data]);

//       form.reset();
//     } catch (error: any) {
//       console.log(error);
//     } finally {
//       router.refresh();
//     }
//   };

//   // Function to copy code to clipboard
//   const copyToClipboard = (code: string) => {
//     navigator.clipboard.writeText(code);
//     alert("Code copied to clipboard!");
//   };

//   return (
//     <div>
//       <Heading
//         title="Code Generation"
//         description="Generate code using descriptive text."
//         icon={Code}
//         iconColor="text-green-700"
//         bgColor="bg-green-700/10"
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
//                   <FormItem className="col-span-12 lg:col-span-10">
//                     <FormControl className="m-0 p-0">
//                       <Input
//                         className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
//                         disabled={isLoading}
//                         placeholder="Simple toggle button using react hooks"
//                         {...field}
//                         autoComplete="off"
//                       />
//                     </FormControl>
//                   </FormItem>
//                 )}
//               />
//               <Button className="col-span-12 lg:col-span-2 w-full" disabled={isLoading}>
//                 Generate
//               </Button>
//             </form>
//           </Form>
//         </div>
//         <div className="space-y-4 mt-4">
//           {isLoading && (
//             <div className="p-8 rounded-lg w-full flex item-center justify-center bg-muted">
//               <Loader />
//             </div>
//           )}
//           {messages.length === 0 && !isLoading && (
//             <Empty label="No Conversation started." />
//           )}
//           <div className="flex flex-col-reverse gap-y-4">
//             {messages.reduce((acc: JSX.Element[], message, index) => {
//               if (index % 2 === 0) {
//                 const response = messages[index + 1];
//                 acc.push(
//                   <div key={message.content} className="space-y-1">
//                     <div className="inline-block bg-slate-100 px-2 py-1 rounded-full">
//                       {message.content}
//                     </div>
//                     {response && (
//                       <div className="relative">
//                         <button
//                           className="absolute top-2 right-2 text-sm bg-gray-200 px-2 py-1 rounded"
//                           onClick={() => copyToClipboard(response.content)}
//                         >
//                           Copy Code
//                         </button>
//                         <ReactMarkdown
//                           components={{
//                             code({ node, inline, className, children, ...props }: any) {
//                               const match = /language-(\w+)/.exec(className || "");
//                               return !inline && match ? (
//                                 <SyntaxHighlighter
//                                   style={vscDarkPlus as any} // Cast the style to 'any' to bypass the type issue
//                                   language={match[1]}
//                                   PreTag="div"
//                                   {...props}
//                                 >
//                                   {String(children).replace(/\n$/, "")}
//                                 </SyntaxHighlighter>
//                               ) : (
//                                 <code
//                                   className="bg-black text-white rounded-lg p-1"
//                                   {...props}
//                                 >
//                                   {children}
//                                 </code>
//                               ),

//                             },
//                           }}
//                         >
//                           {response.content || ""}
//                         </ReactMarkdown>
//                       </div>
//                     )}
//                   </div>
//                 );
//               }
//               return acc;
//             }, [])}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CodePage;













"use client"
import axios from "axios"
import * as z from "zod"
import React, { useEffect, useState } from 'react'
import Heading from '@/components/Heading';
import { Code, Divide, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Empty } from "@/components/Empty";
import { Loader } from "@/components/Loader";
import ReactMarkdown from "react-markdown";


interface Message {
  role: string;
  content: string;
}

const CodePage = () => {
    const [copied , setCopied] = useState("Copy");
    const router = useRouter();
    const [messages , setMessages] = useState<Message[]>([]);
    const [selectedModel, setSelectedModel] = useState("OpenAI");
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
        defaultValues:{
            promt: ""
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) =>{
      try{
        const userMessage: Message = {
          role: "user",
          content: values.promt,
        };
        const newMessages = [...messages, userMessage ]
        let endpoint = "OpenAI"
         if (selectedModel === "OpenAI"){
          console.log(selectedModel)
          endpoint = "/api/code/openai"
        } else if(selectedModel === "claude-3-5-sonnet"){
          console.log(selectedModel)
          endpoint = "/api/code/claude-3-5-sonnet"
        }
          

        const response = await axios.post(endpoint, {messages: newMessages});

        setMessages((current) => [...current ,  userMessage , response.data ]);
      
        form.reset();


      }catch(error: any){

        //TODO: Open pro model
        console.log(error);
      } finally{
        router.refresh();
      }
    };

      // Function to copy code to clipboard
    // const copyToClipboard = (code: string) => {
    //   navigator.clipboard.writeText(code);
    //   setCopied("Copied!!");
    // };

    // useEffect(()=>{
    //   setCopied("Copy")
    // })

  return (
    <div>
        <Heading 
        title="Code Generation"
        description="Generate code using descriptive text."
        icon={Code}
        iconColor="text-green-700"
        bgColor="bg-green-700/10"
        />
        <div className='px-4 lg:px-8'>
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-lg border w-full p-2 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2">
                <FormField name="promt"
                  render={({field}) => (
                    <FormItem
                    className="col-span-12 lg:col-span-8">
                      <FormControl className="m-0 p-0">
                        <Input className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent "
                        disabled={isLoading} 
                        placeholder="Simple toggle button using react hooks"
                        {...field}
                        autoComplete="off"
                        />
                      </FormControl>
                      
                    </FormItem>
                  )}  

                
                />
                <div className="col-span-12 lg:col-span-2">
                <select
                  id="dropdown"
                  name="dropdown"
                  className="w-full border rounded-lg p-2"
                  value={selectedModel} 
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  <option value="OpenAI">OpenAI</option>
                  <option value="claude-3-5-sonnet">Claude-3-5-sonnet</option>
                </select>
              </div>
                <Button className="col-span-12 lg:col-span-2 w-full" disabled={isLoading}>
                  Generate
                </Button>

              </form>
            </Form>
          </div>
          <div className="space-y-4 mt-4">
            {
              isLoading && (
                <div className="p-8 rounded-lg w-full flex item-center justify-center bg-muted">
                  <Loader />
                </div>
              )
            }
            {
              messages.length === 0 && !isLoading && (
                <Empty label="No Conversation started." />
              )
            }
          <div className="flex flex-col-reverse gap-y-4">
            {messages.reduce((acc: JSX.Element[], message, index) => {
   
            if (index % 2 === 0) {
              const response = messages[index + 1];
              acc.push(
                <div key={message.content} className="space-y-1">
                  <div className="inline-block bg-slate-100 px-2 py-1 rounded-full">
                    {message.content}
                  </div>
                  {response && (

                    
                        
                     

                    <ReactMarkdown components={{
                      pre: ({node, ...props}) =>(
                        <div className="overflow-auto w-full my-2 bg-black text-white p-2 rounded-lg relative">
                          {/* <button
                            className="absolute top-2 right-2 text-sm bg-gray-200 text-black px-2 py-1 rounded"
                            onClick={() => copyToClipboard(response.content)}
                            >
                            {copied}
                        </button> */}
                          <pre {...props}/>
                        </div>
                      ),
                      code: ({node , ...props}) =>(
                        <code className="bg-black text-white rounded-lg p-0.5" {...props}/>
                      )
                    }} className="bg-black/10 p-3 rounded-lg" >
                      {
                        response.content || ""
                      }
                    </ReactMarkdown>
                    
                  )
                  }
        </div>
      );
    }
    return acc;
  }, [])}
</div>

          </div>
        </div>
    </div>
  )
}

export default CodePage;

 

