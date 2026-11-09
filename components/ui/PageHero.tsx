import type { ReactNode } from "react";
import { Photo } from "./Photo";

type PageHeroProps = {
  image: string | null;
  imageAlt: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  meta?: ReactNode;
  tall?: boolean;
};

/** Full-bleed photographic page header used across the site. */
export function PageHero({ image, imageAlt, title, description, children, meta, tall = false }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-[#0e1612] text-white">
      <Photo src={image} alt={imageAlt} priority className="absolute inset-0 -z-20 h-full w-full" />
      <div className="img-scrim-side absolute inset-0 -z-10" />
      <div className={`container-page flex flex-col justify-end ${tall ? "min-h-[34rem]" : "min-h-[24rem]"} py-14 sm:py-20`}>
        {meta && <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-white/80">{meta}</div>}
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-6xl">{title}</h1>
        {description && <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg">{description}</p>}
        {children && <div className="mt-8 flex flex-wrap items-center gap-3">{children}</div>}
      </div>
    </section>
  );
}
