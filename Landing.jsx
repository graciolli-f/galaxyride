import { GalaxyCanvas } from 'react-galaxy-canvas';

const Landing = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <GalaxyCanvas
        effect="starfield"
        options={{
          stars: 400,
          colorStart: '#8800ff',
          colorEnd: '#ffff00'
        }}
      />
    </div>
  );
};

export default Landing; 