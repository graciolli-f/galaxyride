import React from 'react';
import GalaxyCanvas from './components/GalaxyCanvas';

const App = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <GalaxyCanvas
        effect="starfield"
        options={{
          stars: 400,
          speed: 0.7,
          colorStart: '#8800ff',
          colorEnd: '#ffff00'
        }}
      />
    </div>
  );
};

export default App; 