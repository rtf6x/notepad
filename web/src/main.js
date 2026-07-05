import { mount } from 'svelte';
import App from './App.svelte';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import './scrollbars.css';

mount(App, { target: document.getElementById('app') });
