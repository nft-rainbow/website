import Head from 'next/head';
import '../css/global.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>NFTRainbow - One Stop NFT Infrastructure & Service</title>
                <link rel="shortcut icon" href="/images/logo.svg" type="image/svg+xml"></link>
            </Head>
            <div className="m-w-[1440px]">
                <Component {...pageProps} />
            </div>
        </>
    );
}
