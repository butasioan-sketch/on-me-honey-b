'use client';

import InteractiveConfigurator from '../components/InteractiveConfigurator';

export default function KonfiguratorPage() {
  return (
    <InteractiveConfigurator
      productId="1"
      productName="AirFit Pro T-Shirt"
      modelPath="/models/shirt-white-v2.glb"
      price={44.99}
      onDesignChange={(design) => {
        console.log('Design changed:', design);
      }}
      onSave={(design) => {
        console.log('Design saved:', design);
        alert('Design gespeichert! 🎉');
      }}
      onAddToCart={(design) => {
        console.log('Added to cart:', design);
        alert('Zum Warenkorb hinzugefügt! 🛒');
      }}
    />
  );
}
