import Image, { ImageProps } from "next/image";

type RemoteImageProps = Omit<ImageProps, "unoptimized"> & {
  src: string;
};

/** Avoid build-time remote image optimization failures (e.g. offline CI). */
export default function RemoteImage(props: RemoteImageProps) {
  return <Image {...props} unoptimized />;
}
