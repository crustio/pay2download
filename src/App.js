import './App.css';
import Webpages from './webpages';
import { Provider as StoreProvider } from "react-redux";
import { Store } from "./redux/Store";

function App() {
  return (
    <div>
      <StoreProvider store={Store}>
        <Webpages />
      </StoreProvider>
    </div>
  );
}

export default App;
