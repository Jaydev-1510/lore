import type { GraphData } from './types';

export const MOCK_GRAPH: GraphData = {
  nodes: [
    { id: 'tesla', label: 'Nikola Tesla', depth: 0, summary: 'Serbian-American inventor and electrical engineer. Pioneer of alternating current electrical systems and the Tesla coil.' },
    { id: 'ac', label: 'Alternating Current', depth: 1, summary: 'Electric current that periodically reverses direction. Enables efficient long-distance power transmission.' },
    { id: 'coil', label: 'Tesla Coil', depth: 1, summary: 'Resonant transformer circuit producing high-voltage, high-frequency AC electricity. Invented in 1891.' },
    { id: 'edison', label: 'Thomas Edison', depth: 1, summary: 'American inventor who championed direct current. Tesla\'s chief rival in the War of Currents.' },
    { id: 'westinghouse', label: 'Westinghouse Electric', depth: 1, summary: 'Manufacturing company that backed Tesla\'s AC system and won the War of Currents.' },
    { id: 'xray', label: 'X-Ray Research', depth: 1, summary: 'Tesla produced shadowgraph images before Röntgen — an overlooked chapter of radiography history.' },
    { id: 'radio', label: 'Radio Waves', depth: 2, summary: 'Tesla demonstrated wireless signal transmission in 1893, predating Marconi\'s patent by years.' },
    { id: 'wardenclyffe', label: 'Wardenclyffe Tower', depth: 2, summary: 'Tesla\'s unfinished 57-metre transmission tower. Intended for transatlantic wireless communication and free energy.' },
    { id: 'resonance', label: 'Resonant Frequency', depth: 2, summary: 'Tesla believed the Earth itself resonated at 7.83 Hz — later confirmed as the Schumann resonance.' },
  ],
  links: [
    { source: 'tesla', target: 'ac' },
    { source: 'tesla', target: 'coil' },
    { source: 'tesla', target: 'edison' },
    { source: 'tesla', target: 'westinghouse' },
    { source: 'tesla', target: 'xray' },
    { source: 'ac', target: 'radio' },
    { source: 'coil', target: 'wardenclyffe' },
    { source: 'coil', target: 'resonance' },
  ]
};
