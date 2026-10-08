import { preload } from 'react-dom';
import App from '@/components/App';

export default function Page() {
  // the hero poster is the largest paint: fetch it first
  preload('/hero/poster.webp', { as: 'image', fetchPriority: 'high' });
  return <App />;
}
