import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import Header from '@/components/Header'
import { Toaster } from 'sonner'
import { type QueryClient } from "@tanstack/react-query";

interface RouterContext {
  queryClient: QueryClient;
}


export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
function RootComponent() {
  return (
    <>
      <div className='flex flex-col min-h-screen bg-[#f5fcf8] text-foreground'>
        <Header />
        <main className="container flex-1 p-4 mx-auto">
          <Outlet />
        </main>
        <footer className="p-4 text-center">
          <p className="text-sm text-muted-foreground">BetterNews &copy;</p>
        </footer>
      </div>
      <Toaster />
      <ReactQueryDevtools />
      <TanStackRouterDevtools position="bottom-left" />
    </>
  )
}
