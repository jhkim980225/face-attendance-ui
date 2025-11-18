import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/global.css';

const root = document.getElementById('root')!;
createRoot(root).render(<App />);  // ← StrictMode 제거

