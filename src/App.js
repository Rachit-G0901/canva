import React from 'react';
import Sidebar from './components/sidebar/Sidebar.js';
import EditorPage from './components/editorPage/EditorPage.js';

const App = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <EditorPage />
    </div>
  );
};

export default App;
