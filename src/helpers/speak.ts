import { delay } from "./delay";

let speakCounter = 0;
export function speak(template: TemplateStringsArray, ...args: number[]): Promise<void>;
export function speak(text:string): Promise<void>;
export async function speak(text: string|TemplateStringsArray, ...args: number[])
{
    if (speakCounter === 0)
    {
        document.dispatchEvent(new CustomEvent("start-speak"));
    }

    speakCounter++;
    await new Promise<void>(async(ok, ko) =>
    {
        if (typeof text !== 'string')
        {
            try
            {
                for (let i = 0; i < text.length; i++)
                {
                    text[i] && await speak(text[i]);
                    args[i] && await delay(args[i]);
                }

                ok();
            }
            catch(error)
            {
                ko(error);
            }

            return;
        }

        const message = new SpeechSynthesisUtterance(text);
        message.lang = 'fr';
        message.onend = ok as any;
        message.onerror = ko;
        speechSynthesis.speak(message);
    });

    speakCounter--;
    if (speakCounter === 0)
    {
        document.dispatchEvent(new CustomEvent("end-speak"));
    }
}