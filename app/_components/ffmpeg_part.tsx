"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function FfmpegPart() {
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef<HTMLParagraphElement | null>(null);
  const [image_url, set_image_url] = useState<null | string>(null);

  const load = async () => {
    setIsLoading(true);
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const ffmpeg = ffmpegRef.current;
    const log = [];
    ffmpeg.on("log", ({ message, type }) => {
      console.log("type=", type, "message=", message);
      if (messageRef.current) messageRef.current.innerHTML = message;
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
    });
    setLoaded(true);
    setIsLoading(false);
  };
  const convert = async (el: HTMLInputElement) => {
    const ffmpeg = ffmpegRef.current;
    const file = el.files?.item(0);
    if (!file) return;
    await ffmpeg.writeFile(`input`, await fetchFile(file));
    // ❯ ffmpeg -i HoFLogo.png -vf scale=256:256:force_original_aspect_ratio=decrease,pad=256:256:-1:-1:color=#00000000 favicon.ico
    await ffmpeg.exec([
      "-i",
      "input",
      "-vf",
      "scale=256:256:force_original_aspect_ratio=decrease,format=rgba,pad=256:256:-1:-1:color=#00000000",
      "favicon.ico",
    ]);
    const data = (await ffmpeg.readFile("favicon.ico")) as any;
    set_image_url(
      URL.createObjectURL(
        new Blob([data.buffer], { type: "image/vnd.microsoft.icon" }),
      ),
    );
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-neutral-400 dark:text-neutral-400 text-lg">
          {loaded ? "Loaded ffmpeg" : "Loading ffmpeg..."}
        </p>
        <p className="text-neutral-400 text-lg" ref={messageRef} />
      </div>

      <div className="mb-8">
        <input
          disabled={!loaded}
          onChange={(ev) => convert(ev.currentTarget)}
          type="file"
          name="file"
          id="file"
          className="sr-only"
        />
        <label
          htmlFor="file"
          className="relative flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-neutral-200 dark:border-neutral-700  p-12 text-center"
        >
          <div>
            <span className="mb-2 block text-xl font-semibold dark:text-neutral-400">
              Drop files here
            </span>
            <span className="mb-2 block text-base font-medium dark:text-neutral-500">
              Or
            </span>
            <span className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-700 py-2 px-7 text-base font-medium dark:text-neutral-400">
              Browse
            </span>
          </div>
        </label>
      </div>
      {image_url && (
        <div className="flex mx-auto flex-col w-fit">
          <div className="flex flex-col items-center justify-center bg-neutral-200 dark:bg-neutral-800 border border-dotted border-neutral-500 rounded-lg p-5">
            <img alt="bleh" src={image_url} />
          </div>
        </div>
      )}
    </div>
  );
}
