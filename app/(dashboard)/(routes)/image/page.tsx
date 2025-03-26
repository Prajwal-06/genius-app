"use client";

import * as z from "zod";
import React, { useState } from "react";
import Heading from "@/components/Heading";
import { MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/Empty";
import { Loader } from "@/components/Loader";



interface Message {
  role: string;
  content: string;
}

const ImageGenerationPage = () => {

  const [messages, setMessages] = useState<Message[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form Submitted! Values:", values);
  
    try {
      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: values.prompt }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to generate image");
      }
  
      const data = await response.json();
      console.log("Image Generated:", data);
  
      // Update state to display generated image
      setMessages((prev) => [
        ...prev,
        { role: "user", content: values.prompt },
        { role: "assistant", content: data.imageUrl },
      ]);
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Error generating image. Please try again.");
    }
  };


  //download

  const downloadImage = (imageUrl: string, index: number) => {
    const isBase64 = imageUrl.startsWith("data:image");
    const fileName = `generated-image-${index}.jpg`;
  
    if (isBase64) {
      // Convert Base64 to a Blob
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  
  
  

  return (
    <div>
      <Heading
        title="Image Generation"
        description="Generate images using different AI models"
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8">
        <Form {...form}>
          <form
            onSubmit={(e) => { 
                e.preventDefault(); 
                console.log("Form is being submitted!"); // Debugging step
                form.handleSubmit(onSubmit)(); 
              }}
            className="rounded-lg border w-full p-2 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                      placeholder="Describe your image prompt"
                      {...field}
                      autoComplete="off"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button className="col-span-12 lg:col-span-2" disabled={isLoading}>
              Generate
            </Button>
          </form>
        </Form>
        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex item-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          {messages.length === 0 && !isLoading && <Empty label="No images generated yet." />}
          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message, index) => (
              <div key={index} className="space-y-1">
                
                
                {index % 2 !== 0 && message.content && (
                <><img src={message.content} alt="Generated Image" className="mt-2 rounded shadow-lg max-w-full" />
                <Button onClick={() => downloadImage(message.content, index)}        className="mt-2">
                            Download
                        </Button></>
                )}

                {
                    index%2 == 0 && message.content && (
                    <div className="inline-block bg-slate-100 px-2 py-1 rounded-full">
                    {message.content}
                    </div>
                    )
                }

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationPage;




