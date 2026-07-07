import { useRouter as useNextRouter } from "next/navigation";
import { usePageLoadingStore } from "@/stores/page-loading-store";

export function useAppRouter() {
    const router = useNextRouter();
    const startLoading = usePageLoadingStore((state) => state.startLoading);

    return {
        ...router,
        push: (href: string, options?: Parameters<typeof router.push>[1]) => {
            startLoading();
            router.push(href, options);
        },
        replace: (href: string, options?: Parameters<typeof router.replace>[1]) => {
            startLoading();
            router.replace(href, options);
        },
    };
}
