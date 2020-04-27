import SherRangeInput from './SherRangeInput.js';

document.addEventListener('DOMContentLoaded', e => {
  let print = console.log;

  let seek = document.querySelector('.seek-bar');
  let speed = document.querySelectorAll('.speed-controler div');
  let volume = document.querySelectorAll('.volume-controler div');

  let seekInput = SherRangeInput(seek, 0, 100, 0.01, 0, false);
  let speedInput = SherRangeInput(speed[1], 0.25, 3, 0.01, 1);
  let volumeInput = SherRangeInput(volume[0], 0, 1, 0.01, 0.8);
});