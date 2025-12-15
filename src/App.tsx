import React from 'react';
import './App.css';
import DivvyChatServiceDemo from './examples/DivvyChatServiceDemo';

function App() {
  return (
    <div className="App">
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1 style={{ color: '#744da9', marginBottom: '20px' }}>DivvyChat Service Demo</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          This demo shows the DivvyloreChatWidget integrated with the DivvyChatService backend.
        </p>
      </div>
      
      <DivvyChatServiceDemo />
    </div>
  )
}

export default App
