import * as React from "react";
import styled from "styled-components";
import logo from "./logo.svg";
import "./App.css";

const ColoredLink = styled.a`
  color: red;
  font-weight: bold;
`;

function App() {
  const [count, setCount] = React.useState<number>(0);
  return (
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
  );
}

export default App;
