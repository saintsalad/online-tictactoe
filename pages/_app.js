import '../styles/globals.css'
import {Toaster} from "../components/ui/sonner";
import {SessionProvider} from "next-auth/react";

function MyApp({ Component, pageProps }) {
  return (
      <>
          <SessionProvider>
              <Component {...pageProps} />
              <Toaster/>
          </SessionProvider>
      </>
  );
}

export default MyApp
