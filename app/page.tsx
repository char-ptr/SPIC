import Image from "next/image";
import FfmpegPart from "./_components/ffmpeg_part";
import Link from "next/link";
import NoSsr from "./_components/NoSsr";

export default function Home() {
  return (
    <div>
      <div className="flex flex-col gap-2 pb-5">
        <p className="text-xl text-neutral-600 dark:text-neutral-300">
          A completely in browser ico converter which doesn&apos;t defy
          expectations.
        </p>
        <Link
          className="text-lg text-neutral-600 dark:text-neutral-300 underline underline-offset-2 hover:text-neutral-800 hover:dark:text-neutral-100"
          href="/why"
        >
          Why did i make this?
        </Link>
      </div>
      <NoSsr>
        <FfmpegPart />
      </NoSsr>
    </div>
  );
}
