// In your page.js or other component file
// import {GeneratePrompt} from "../components/GeneratePrompt";
// import LoginUI from "./login/page";
// import Home from '../components/Home';

import Home from "./components/Home";
import DeviceInfoLogger from "./components/DeviceInfoLogger";

export default function HomePage() {
  return (
    <main>
      <DeviceInfoLogger />
      {/* <GeneratePrompt /> */}
      {/* <LoginUI/> */}
      <Home/>
    </main>
  );
}