import Head from 'next/head'
import LuxuryNavbar from '../components/LuxuryNavbar'
import ContactFooter from '../components/ContactFooter'
import '../styles/globals.css'

export const metadata = {
  title: 'Shadow Leo Studio',
  description: 'Shadow Leo Studio Website',
  verification: {
    google: 'uUEE2-UUrmx4TOelrCLFQ4b4mwcHUtXNUNwhs1lrNec',
  },
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta
          name="google-site-verification"
          content={metadata.verification.google}
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#0a0a0a" />
      </Head>
      <LuxuryNavbar />
      <Component {...pageProps} />
      <ContactFooter />
    </>
  )
}
