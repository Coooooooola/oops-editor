import React, { useEffect, useState } from 'react';
import { Editor } from './editor/Editor';
import './App.css';

function App() {
  const [editor, setEditor] = useState<JSX.Element | null>(null);
  useEffect(() => {
    setTimeout(() => {
      setEditor(<Editor />);
    }, 500);
  }, []);

  return editor;
}

export default App;
