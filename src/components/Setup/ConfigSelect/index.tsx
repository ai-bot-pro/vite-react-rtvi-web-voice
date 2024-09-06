import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  VoiceClientConfigOption,
  VoiceClientServices,
  VoiceEvent,
} from "chat-bot-rtvi-client";
import { useVoiceClient, useVoiceClientEvent } from "chat-bot-rtvi-web-react";
import { cx } from "class-variance-authority";

import { CharacterContext } from "@/components/context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { LLM_MODEL_CHOICES, PRESET_CHARACTERS } from "@/rtvi.config";
import { cn } from "@/utils/tailwind";

import StopSecs from "../StopSecs";

type CharacterData = {
  name: string;
  prompt: string;
  voice: string;
  language: string;
  gender: string;
};

interface ConfigSelectProps {
  state: string;
  onConfigUpdate: (
    config: VoiceClientConfigOption[],
    services: VoiceClientServices
  ) => void;
  onModifyPrompt: () => void;
  inSession?: boolean;
}

const llmProviders = LLM_MODEL_CHOICES.map((choice) => ({
  label: choice.label,
  value: choice.value,
  base_url: choice.base_url,
  models: choice.models,
}));

const tileCX = cx(
  "*:opacity-50 cursor-pointer rounded-xl px-4 py-3 bg-white border border-primary-200 bg-white select-none ring-ring transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
);
const tileActiveCX = cx("*:opacity-100 bg-primary-100/70 border-transparent");

export const ConfigSelect: React.FC<ConfigSelectProps> = ({
  onConfigUpdate,
  onModifyPrompt,
  state,
  inSession = false,
}) => {
  const voiceClient = useVoiceClient();
  const { character, setCharacter } = useContext(CharacterContext);
  const [llmProvider, setLlmProvider] = useState<string>();
  const [llmModel, setLlmModel] = useState<string>();
  const [llmBaseUrl, setLlmBaseUrl] = useState<string>();
  const [vadStopSecs, setVadStopSecs] = useState<number>();
  const [bufferedCharacter, setBufferedCharacter] = useState<number>(character);

  useVoiceClientEvent(
    VoiceEvent.ConfigUpdated,
    useCallback(() => {
      setCharacter(bufferedCharacter);
    }, [bufferedCharacter, setCharacter])
  );

  // Assign default values to llm provider and model from client config
  useEffect(() => {
    if (!voiceClient) return;

    // Get the current llm provider and model
    setLlmProvider(voiceClient?.services.llm ?? llmProviders[0].value);

    // Get the current llm model
    voiceClient.getServiceOptionsFromConfig("llm").options.find((option) => {
      if (option.name === "model") {
        setLlmModel(
          (option.value as string) ?? llmProviders[0].models[0].value
        );
      }
      if (option.name === "base_url") {
        setLlmBaseUrl((option.value as string) ?? llmProviders[0].base_url);
      }
    });

    // Get the current vad stop secs
    voiceClient.getServiceOptionsFromConfig("vad").options.find((option) => {
      if (option.name === "args") {
        setVadStopSecs((option.value as { stop_secs: number }).stop_secs);
      }
    });
  }, [voiceClient]);

  // Update the config options when the character changes
  useEffect(() => {
    if (!llmModel || !llmProvider || !vadStopSecs || !voiceClient) return;

    // Get character data and update config
    const characterData = PRESET_CHARACTERS[bufferedCharacter] as CharacterData;

    const updatedConfigOptions: VoiceClientConfigOption[] = [
      {
        service: "vad",
        options: [
          { name: "args", value: { stop_secs: vadStopSecs } },
          { name: "tag", value: "silero_vad_analyzer" },
        ],
      },
      {
        service: "asr",
        options: [
          {
            name: "args",
            value: { language: characterData.language, model: "nova-2" },
          },
          { name: "tag", value: "deepgram_asr_processor" },
        ],
      },
      {
        service: "llm",
        options: [
          { name: "base_url", value: llmBaseUrl },
          { name: "model", value: llmModel },
          {
            name: "messages",
            value: [
              {
                role: "system",
                content: characterData.prompt
                  .split("\n")
                  .map((line) => line.trim())
                  .join("\n"),
              },
            ],
          },
          { name: "tag", value: "openai_llm_processor" },
        ],
      },
      {
        service: "tts",
        options: [
          {
            name: "args",
            value: {
              voice_name: characterData.voice,
              language: characterData.language,
              gender: characterData.gender,
            },
          },
          { name: "tag", value: "tts_edge" },
        ],
      },
    ];

    console.log("updatedConfigOptions", updatedConfigOptions);
    onConfigUpdate(updatedConfigOptions, { llm: llmProvider });
  }, [
    llmProvider,
    llmBaseUrl,
    llmModel,
    onConfigUpdate,
    bufferedCharacter,
    vadStopSecs,
    voiceClient,
  ]);

  const availableModels = LLM_MODEL_CHOICES.find(
    (choice) => choice.value === llmProvider
  )?.models;

  return (
    <div className="flex flex-col flex-wrap gap-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="character">
          <AccordionTrigger>Character</AccordionTrigger>
          <AccordionContent>
            <Field error={false}>
              <div className="w-full flex flex-col md:flex-row gap-2">
                <Select
                  disabled={inSession && !["ready", "idle"].includes(state)}
                  className="flex-1"
                  value={bufferedCharacter}
                  onChange={(e) =>
                    setBufferedCharacter(parseInt(e.currentTarget.value))
                  }
                >
                  {PRESET_CHARACTERS.map(({ name }, i) => (
                    <option key={`char-${i}`} value={i}>
                      {name}
                    </option>
                  ))}
                </Select>
                <Button variant="light" onClick={onModifyPrompt}>
                  Customize
                </Button>
              </div>
            </Field>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="llm">
          <AccordionTrigger>LLM options</AccordionTrigger>
          <AccordionContent>
            <Field error={false}>
              {!inSession && (
                <>
                  <Label>Provider</Label>
                  <div className="flex flex-row gap-2">
                    {llmProviders.map(({ value, label }) => (
                      <div
                        tabIndex={0}
                        className={cn(
                          tileCX,
                          value === llmProvider && tileActiveCX
                        )}
                        key={value}
                        onClick={() => {
                          if (!["ready", "idle"].includes(state)) return;

                          setLlmProvider(value);
                          setLlmModel(
                            llmProviders.find((p) => p.value === value)
                              ?.models[0].value
                          );
                          setLlmBaseUrl(
                            llmProviders.find((p) => p.value === value)
                              ?.base_url
                          );
                        }}
                      >
                        <img
                          src={`/logo-${value}.svg`}
                          alt={label}
                          width="200"
                          height="60"
                          className="user-select-none pointer-events-none"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Label>Model</Label>
              <Select
                onChange={(e) => setLlmModel(e.currentTarget.value)}
                value={llmModel}
              >
                {availableModels?.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="voice">
          <AccordionTrigger>Voice config</AccordionTrigger>
          <AccordionContent>
            <StopSecs
              vadStopSecs={vadStopSecs}
              handleChange={(v) => {
                setVadStopSecs(v[0]);
              }}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ConfigSelect;
