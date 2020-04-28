import React, { useEffect, useState } from 'react';
import { Editor } from './editor/Editor';
import './App.css';

function App() {
  const [editor, setEditor] = useState<React.ReactNode>(null);
  useEffect(() => {
    setTimeout(() => {
      setEditor(<Editor />);
    }, 1000);
  }, []);
  return (
    <div>
      {editor}
    </div>
  );
}

export default App;
