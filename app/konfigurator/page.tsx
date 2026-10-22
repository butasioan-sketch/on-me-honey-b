'use client';

import InteractiveConfigurator from '../components/InteractiveConfigurator';

export default function KonfiguratorPage() {
  return (
    <InteractiveConfigurator
      productId="1"
      productName="AirFit Pro T-Shirt"
      modelPath="/models/shirt-white-v2.glb"
      onDesignChange={(design) => {
        console.log('Design changed:', design);
      }}
      onSave={(design) => {
        console.log('Design saved:', design);
        alert('Design gespeichert! 🎉');
      }}
    />
  );
}
