import Layout from "@/components/Layout";
import "../styles/globals.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
