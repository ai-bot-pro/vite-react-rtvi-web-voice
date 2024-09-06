import React, { useState } from "react";
import {
  ConfigOption,
  LLMContextMessage,
  LLMHelper,
  VoiceClientConfigOption,
  VoiceEvent,
} from "chat-bot-rtvi-client";
import { useVoiceClient, useVoiceClientEvent } from "chat-bot-rtvi-web-react";

import { Button } from "../ui/button";
import * as Card from "../ui/card";
import { Textarea } from "../ui/textarea";

type PromptProps = {
  handleClose: () => void;
};

const Prompt: React.FC<PromptProps> = ({ handleClose }) => {
  const voiceClient = useVoiceClient()!;
  const [prompt, setPrompt] = useState<LLMContextMessage[] | undefined>(
    undefined
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  useVoiceClientEvent(
    VoiceEvent.ConfigUpdated,
    (config: VoiceClientConfigOption[]) => {
      const p = config
        .find((c: VoiceClientConfigOption) => c.service === "llm")
        ?.options?.find((o: ConfigOption) => o.name === "messages")?.value as
        | LLMContextMessage[]
        | undefined;

      setPrompt(p);
    }
  );

  function save() {
    if (!voiceClient) return;

    if (voiceClient.state === "ready") {
      const llmHelper = voiceClient.getHelper("llm") as LLMHelper;
      llmHelper.setContext({ messages: prompt }, true);
    } else {
      voiceClient.setServiceOptionInConfig("llm", {
        name: "messages",
        value: prompt,
      });
    }

    setHasUnsavedChanges(false);
  }

  const updateContextMessage = (index: number, content: string) => {
    setPrompt((prev) => {
      if (!prev) return prev;
      const newPrompt = [...prev];
      newPrompt[index].content = content;
      return newPrompt;
    });
    setHasUnsavedChanges(true);
  };

  return (
    <Card.Card className="w-svw max-w-full md:max-w-md lg:max-w-lg">
      <Card.CardHeader>
        <Card.CardTitle>LLM Prompt</Card.CardTitle>
      </Card.CardHeader>
      <Card.CardContent>
        <div className="flex flex-col gap-3">
          {prompt?.map((message, i) => (
            <div key={i} className="flex flex-col gap-1 items-start">
              <span className="font-mono font-bold text-sm">
                {message.role}
              </span>
              <Textarea
                value={message.content}
                rows={prompt?.length <= 1 ? 10 : 5}
                onChange={(e) => updateContextMessage(i, e.currentTarget.value)}
                className="text-sm w-full whitespace-pre-wrap"
              />
            </div>
          ))}
        </div>
      </Card.CardContent>
      <Card.CardFooter isButtonArray>
        <Button onClick={handleClose}>Close</Button>
        <Button
          variant={hasUnsavedChanges ? "success" : "outline"}
          onClick={() => save()}
          disabled={!hasUnsavedChanges}
        >
          Update
        </Button>
      </Card.CardFooter>
    </Card.Card>
  );
};

export default Prompt;
