import React, { useEffect, useState } from "react";
import { Editor } from "./editor/Editor";
import "./App.css";

function App() {
  const [editor, setEditor] = useState<JSX.Element | null>(null);
  useEffect(() => {
    setTimeout(() => {
      setEditor(<Editor />);
    }, 200);
  }, []);

  return <div style={{ margin: 30, border: '1px dashed gray' }}>{editor}</div>;
}

export default App;
