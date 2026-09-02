import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {OrgSessionProvider} from './contexts/OrgSessionContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OrgSessionProvider>
      <App />
    </OrgSessionProvider>
  </StrictMode>,
);
