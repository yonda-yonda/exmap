import * as React from "react";
import { BrowserRouter, Link, Routes, Route } from "react-router-dom";

import CssBaseline from "@mui/material/CssBaseline";

import styled from "styled-components";
import logo from "./logo.svg";

import { Contact } from "~/pages/contact/";
import { About } from "~/pages/about/";
import "./App.css";

const ColoredLink = styled.a`
  color: red;
  font-weight: bold;
`;

function App() {
  const [count, setCount] = React.useState<number>(0);
  return (
    <React.StrictMode>
      <CssBaseline />
      <BrowserRouter>
        <nav
          style={{
            borderBottom: "solid 1px",
            paddingBottom: "1rem",
          }}
        >
          <Link to="/">home</Link> | <Link to="/about">about</Link> |{" "}
          <Link to="/contact">contact</Link>
        </nav>
        <Routes>
          <Route
            path="/"
            element={
              <div className="App">
                <header className="App-header">
                  <img src={logo} className="App-logo" alt="logo" />
                  <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                  </p>
                  <ColoredLink
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      setCount((count) => {
                        return ++count;
                      });
                    }}
                  >
                    Learn React {count}
                  </ColoredLink>
                </header>
              </div>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;
