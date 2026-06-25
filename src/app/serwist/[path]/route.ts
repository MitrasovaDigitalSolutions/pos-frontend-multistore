import path from "node:path";
import { createSerwistRoute } from "@serwist/turbopack";

const route = createSerwistRoute({
    swSrc: path.join(process.cwd(), "src/app/sw.ts"),
    injectionPoint: "self.__SW_MANIFEST",
    // Provide nextConfig explicitly so @serwist/turbopack doesn't
    // have to load it via dynamic import (which can fail with Turbopack).
    nextConfig: {
        distDir: ".next",
        basePath: "/",
    },
});

// Next.js requires these segment config options to be exported as
// direct const declarations — re-exporting from a function return
// value is not supported.
export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

export const generateStaticParams = route.generateStaticParams;
export const GET = route.GET;
