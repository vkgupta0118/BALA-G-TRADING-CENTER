import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { stripBase } from './config/env';
import './styles/index.css';

document.documentElement.classList.add('js');

const container = document.getElementById('root');
if (!container) throw new Error('#root not found');

const app = (
  <StrictMode>
    <App url={stripBase(window.location.pathname)} />
  </StrictMode>
);

// Production HTML is pre-rendered → hydrate. Dev server ships an empty shell → render.
if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
