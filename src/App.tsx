import React from "react";
import Router from "./routes/sections";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { SocketProvider } from "./context/socket-provider";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <SocketProvider>
          <Router />
        </SocketProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
