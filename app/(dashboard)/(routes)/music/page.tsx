"use client";

import axios from "axios";
import * as z from "zod";
import { Music } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Heading } from "@/components/heading";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";

import { formSchema } from "./constants"; // Ensure this schema includes a prompt field

const MusicPage = () => {
  const router = useRouter();
  const [music, setMusic] = useState<string | undefined>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setMusic(undefined); // Reset previous music
      const response = await axios.post("/api/music", values);

      // Log the API response to check if audio is returned correctly
      console.log("API Response:", response.data);

      if (response.data && response.data.audio) {
        const audioBlobUrl = response.data.audio; // This should be the Blob URL
        console.log("Received Audio Blob URL:", audioBlobUrl);
        setMusic(audioBlobUrl); // Set the Blob URL for the audio player
      } else {
        console.error("No audio URL received from backend.");
      }

      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title='Music Generation'
        description='Turn your prompt into music!'
        icon={Music}
        iconColor='text-emerald-500'
        bgColor='bg-emerald-500/10'
      />
      <div className='px-4 lg:px-8'>
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='
              rounded-lg  
              border 
              w-full
              p-4
              px-3
              md:px-6 
              focus-within:shadow-sm  
              grid 
              grid-cols-12 
              gap-2'
            >
              <FormField
                name='prompt'
                render={({ field }) => (
                  <FormItem className='col-span-12 lg:col-span-10'>
                    <FormControl className='m-0 p-0'>
                      <Input
                        className='border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent'
                        disabled={isLoading}
                        placeholder='Piano solo'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                className='col-span-12 lg:col-span-2 w-full'
                disabled={isLoading}
              >
                Generate
              </Button>
            </form>
          </Form>
        </div>
        <div className='space-y-4 mt-4'>
          {isLoading && (
            <div className='p-8 rounded-lg w-full flex items-center justify-center bg-muted'>
              <Loader />
            </div>
          )}
          {!music && !isLoading && <Empty label='No music generated.' />}
          {music && (
            <audio controls className='w-full mt-8'>
              <source src={music} />
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicPage;
