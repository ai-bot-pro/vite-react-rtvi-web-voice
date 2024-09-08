import React from "react";
import { Book } from "lucide-react";

import { Button } from "./ui/button";

type SplashProps = {
  handleReady: () => void;
};

export const Splash: React.FC<SplashProps> = ({ handleReady }) => {
  return (
    <div>
      <main className="w-full flex items-center justify-center">
        <div className="flex flex-col gap-8 lg:gap-12 items-center max-w-full lg:max-w-3xl">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-balance text-left">
            Chat Bots 聊天机器人
          </h1>
          <h3 className="text-primary-500 text-xl font-semibold leading-relaxed">
            support api llm services 支持的api大模型服务(配置可选)
          </h3>

          <p className="text-primary-500 text-xl font-semibold leading-relaxed">
            Groq/Together Llama 3.1 Instruct Turbo &nbsp; 70B <br />
            Groq/Together Llama 3.1 Instruct Turbo &nbsp; 8B <br />
            Together Llama 3.1 Instruct Turbo &nbsp; 405B <br />
            Groq Llama 3 Instruct &nbsp; 70B <br />
            Groq Llama 3 Instruct &nbsp; 8B <br />
            Together Qwen 2 Instruct &nbsp; 72B <br />
            Together Qwen 1.5 Chat &nbsp; 110B <br />
            Together Qwen 1.5 Chat &nbsp; 72B <br />
            Together Google Gemma 2 Instruct &nbsp; 27B <br />
            Groq/Together Google Gemma 2 Instruct &nbsp; 9B <br />
            Groq Google Gemma Instruct &nbsp; 7B <br />
          </p>

          <Button onClick={() => handleReady()}>Let&apos;s Chat</Button>

          <div className="h-[1px] bg-primary-300 w-full" />

          <footer className="flex flex-col lg:gap-2">
            <Button variant="light" asChild>
              <a
                href="https://github.com/ai-bot-pro/vite-react-rtvi-web-voice"
                className="text-indigo-600"
              >
                <Book className="size-6" />
                FE source code [vite-react-rtvi-web-voice]
                前端源码【vite-react-rtvi-web-voice】
              </a>
            </Button>
            <Button variant="light" asChild>
              <a
                href="https://github.com/ai-bot-pro/achatbot"
                className="text-indigo-600"
              >
                <Book className="size-6" />
                BE source code [achatbot], welcome to contribute!
                后端源码【achatbot】，欢迎参与贡献！
              </a>
            </Button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Splash;
