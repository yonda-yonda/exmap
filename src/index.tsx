import ReactDOM from "react-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <HelmetProvider>
    <Helmet>
      <title>My Experimental Site</title>
      <meta name="description" content="Enjoy trial and error!" />
      <link rel="canonical" href="https://yonda-yonda.github.io/exmap" />
      <link
        rel="icon"
        type="image/x-icon"
        href="https://github.githubassets.com/favicon.ico"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
      />
    </Helmet>
    <App />
  </HelmetProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
