import { createRoot } from 'react-dom/client';
import { BugWidget } from './components/BugWidget';
import './index.css';

// Create a container for the widget if it doesn't exist
const id = 'bugsnap-widget-root';
let container = document.getElementById(id);

if (!container) {
  container = document.createElement('div');
  container.id = id;
  document.body.appendChild(container);
}

const root = createRoot(container);
root.render(<BugWidget />);
