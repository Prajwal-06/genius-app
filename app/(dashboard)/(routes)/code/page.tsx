"use client"
import axios from "axios"
import * as z from "zod"
import React, { useState } from 'react'
import Heading from '@/components/Heading';
import { Code , Play } from 'lucide-react';
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
import { toast } from "sonner";


interface Message {
  role: string;
  content: string;
}

const CodePage = () => {
    
    const router = useRouter();
    const [messages , setMessages] = useState<Message[]>([]);
    const [copiedResponses, setCopiedResponses] = useState<Record<number, boolean>>({});
    const [selectedModel, setSelectedModel] = useState("OpenAI");
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
        defaultValues:{
            promt: ""
        }
    });

    const isLoading = form.formState.isSubmitting;

    const copyToClipboard = async (text: string, responseIndex: number) => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
        setCopiedResponses(prev => ({ ...prev, [responseIndex]: true }));
        setTimeout(() => {
          setCopiedResponses(prev => ({ ...prev, [responseIndex]: false }));
        }, 10000);
      } catch (err) {
        toast.error("Failed to copy to clipboard");
      }
    };

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


      }catch(error){

        //TODO: Open pro model
        console.log(error);
      } finally{
        router.refresh();
      }
    };

 

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
                    <div key={index} className="space-y-1">
                    <div className="inline-block bg-slate-100 px-2 py-1 rounded-full">
                        {message.content}
                    </div>
                    {response && (
                        <ReactMarkdown
                        components={{
                            pre: ({ ...props }) => (
                            <div className="overflow-auto w-full my-2 bg-black text-white p-2 rounded-lg relative">
                                <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                    onClick={() => copyToClipboard(response.content, index + 1)}
                                    className="text-sm bg-gray-200 text-black px-2 py-1 rounded"
                                >
                                    {copiedResponses[index + 1] ? "Copied!" : "Copy"}
                                </button>
                                <button
                                    onClick={() => window.open(
                                    "https://www.programiz.com/python-programming/online-compiler/", 
                                    "_blank"
                                    )}
                                    className="text-sm bg-gray-200 text-black px-2 py-1 rounded flex items-center"
                                >
                                    <Play className="w-4 h-4 mr-1" />
                                    Run
                                </button>
                                </div>
                                <pre {...props} />
                            </div>
                            ),
                            code: ({ ...props }) => (
                            <code className="bg-black text-white rounded-lg p-0.5" {...props} />
                            )
                        }}
                        className="bg-black/10 p-3 rounded-lg"
                        >
                        {response.content || ""}
                        </ReactMarkdown>
                    )}
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

 

