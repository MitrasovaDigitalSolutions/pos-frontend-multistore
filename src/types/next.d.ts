/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'next' {
  export type NextConfig = any;
  export type Metadata = any;
}
declare module 'next/link' {
  const Link: any;
  export default Link;
}
declare module 'next/navigation' {
  export const useRouter: any;
  export const usePathname: any;
  export const useSearchParams: any;
  export const redirect: any;
}
declare module 'next/font/google' {
  export const DM_Sans: any;
}
declare module 'next/server' {
  export type NextRequest = any;
  export const NextResponse: any;
}
declare module 'next/types.js' {
  export type ResolvingMetadata = any;
  export type ResolvingViewport = any;
}
declare module 'next/server.js' {
  export type NextRequest = any;
}
