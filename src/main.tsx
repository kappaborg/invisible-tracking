import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Wall } from './wall/Wall';
import './styles/globals.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Missing #root element');
}

const isWall = window.location.pathname.replace(/\/+$/, '') === '/wall';

createRoot(rootEl).render(
  <StrictMode>{isWall ? <Wall /> : <App />}</StrictMode>,
);
