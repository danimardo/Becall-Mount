import { mount } from 'svelte';
import './index.css'; // Use same CSS for Tailwind
import SplashScreen from './components/Splash/SplashScreen.svelte';

const app = mount(SplashScreen, {
  target: document.getElementById('app')!,
});

export default app;
