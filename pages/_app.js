/* pages/_app.js */

import '../styles/globals.css'
import Header from '../components/header'
import Footer from '../components/footer'
import Router from 'next/router';
import NProgress from 'nprogress'; //nprogress module
import 'nprogress/nprogress.css'; //styles of nprogress

//Binding events. 
Router.events.on('routeChangeStart', () => NProgress.start()); Router.events.on('routeChangeComplete', () => NProgress.done()); Router.events.on('routeChangeError', () => NProgress.done());  


function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Header />
        <Component {...pageProps} />
      <Footer />
    </div>
  )

}

export default MyApp
