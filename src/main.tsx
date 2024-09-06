import ReactDOM from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { LLMHelper, VoiceClientOptions } from "chat-bot-rtvi-client";
import { DailyVoiceClient } from "chat-bot-rtvi-daily-client";
import { VoiceClientAudio, VoiceClientProvider } from "chat-bot-rtvi-web-react";

import App from "@/components/App";
import { CharacterProvider } from "@/components/context";
import Header from "@/components/Header";
import Splash from "@/components/Splash";
import {
  BOT_READY_TIMEOUT,
  defaultConfig,
  defaultServices,
} from "@/rtvi.config";
import React from "react";

import "./global.css"; // Note: Core app layout can be found here

// Show marketing splash page
const showSplashPage = import.meta.env.VITE_SHOW_SPLASH ? true : false;
// Show warning on Firefox
// @ts-expect-error - Firefox is not supported
const isFirefox: boolean = typeof InstallTrigger !== "undefined";
const serverUrl = import.meta.env.VITE_BASE_URL;
const botReadyTimeout =
  import.meta.env.VITE_BOT_READY_TIMEOUT || BOT_READY_TIMEOUT;
export const Layout = () => {
  const voiceClientRef = useRef<DailyVoiceClient | null>(null);
  const [showSplash, setShowSplash] = useState<boolean>(showSplashPage);

  useEffect(() => {
    if (!showSplash || voiceClientRef.current) {
      return;
    }

    let voiceClientParams: VoiceClientOptions = {
      baseUrl: serverUrl,
      services: defaultServices,
      config: defaultConfig,
      timeout: botReadyTimeout,
    };
    if (serverUrl.includes("api.cortex.cerebrium.ai")) {
      voiceClientParams = {
        baseUrl: serverUrl,
        services: defaultServices,
        config: defaultConfig,
        timeout: botReadyTimeout,
        customHeaders: {
          Authorization: `Bearer ${import.meta.env.VITE_SERVER_AUTH}`,
        },
        customBodyParams: {
          chat_bot_name: "DailyRTVIGeneralBot",
          info: {
            config_list: defaultConfig,
            services: defaultServices,
          },
        },
      };
    }
    const voiceClient = new DailyVoiceClient(voiceClientParams);

    const llmHelper = new LLMHelper({});
    voiceClient.registerHelper("llm", llmHelper);

    voiceClientRef.current = voiceClient;
  }, [showSplash]);

  if (showSplash) {
    return <Splash handleReady={() => setShowSplash(false)} />;
  }

  return (
    <VoiceClientProvider voiceClient={voiceClientRef.current!}>
      <CharacterProvider>
        <TooltipProvider>
          <main>
            <Header />
            <div id="app">
              <App />
            </div>
          </main>
          <aside id="tray" />
        </TooltipProvider>
      </CharacterProvider>
      <VoiceClientAudio />
    </VoiceClientProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isFirefox && (
      <div className="bg-red-500 text-white text-sm font-bold text-center p-2 fixed t-0 w-full">
        Voice activity detection not supported in Firefox. For best results,
        please use Chrome or Edge.
      </div>
    )}
    <Layout />
  </React.StrictMode>
);
