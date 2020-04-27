function createElement(e, c) {
  e = document.createElement(e);
  if (c) e.className = c;
  return e;
}

let thumbWidth = '15';

let style = createElement('style');
style.type = 'text/css';

style.innerHTML = `
  .sher-range-input {
    width: 100% !important;
    height: 100% !important;
    position: relative;
    display: grid;
    align-items: center;
    justify-items: center;
  }
  .sher-range-input *{
    margin: 0;
    padding: 0;
    height: .2em !important;
    position: absolute;
  }
  .sher-range-fill {
    width: 100% !important;
    position: absolute;
    z-index: 1;
    background-color: #000;
  }

  .sher-range-filler {
    left: 0;
    width: 0;
    background-color: royalblue;
  }

  .sher-range-fill {
    z-index: 0;
  }

  .sher-range {
    width: 100% !important;
    height: 100% !important;
    -webkit-appearance: none;
    background-color: #0000;
    outline: none;
    cursor: pointer;
  }
  .sher-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: ${thumbWidth}px;
    height: ${thumbWidth}px;
    background-color: royalblue;
    border-radius: 50%;
  }
  .sher-range::-webkit-slider-thumb:hover {
    box-shadow: 0 0 0 .2em #fff;
  }

  .sher-show-value {
    top: -.5em;
    font-size: 14px;
    color: #fff;
    width: unset !important;
    height: unset !important;
  }
`;

document.getElementsByTagName('head')[0].appendChild(style);

export default function SherRangeInput(parent, min_input = 0, max_input = 1, step_input = 1, value = 0, show_value = true) {
  let sherRange = createElement('div', 'sher-range-input');
  let rangeFill = createElement('div', 'sher-range-fill');
  let rangeFiller = createElement('div', 'sher-range-filler');
  let rangeInput = createElement('input', 'sher-range');
  if (show_value) show_value = createElement('div', 'sher-show-value');
  rangeInput.type = 'range';

  rangeInput.min = min_input;
  rangeInput.max = max_input;
  rangeInput.step = step_input;
  rangeInput.value = value;

  let pc = (rangeInput.value - rangeInput.min) / (rangeInput.max - rangeInput.min);
  pc = (pc + (0.5 - pc) * thumbWidth / parent.clientWidth) * 100;

  rangeFiller.style.width = pc + '%';

  if (show_value) {
    show_value.innerText = value;
    show_value.style.left = rangeFiller.style.width;
    show_value.style.transform = 'translateX(-50%)';
    show_value.style.display = 'none';
  }

  rangeInput.oninput = e => {
    let pc = (rangeInput.value - rangeInput.min) / (rangeInput.max - rangeInput.min);
    pc = (pc + (0.5 - pc) * thumbWidth / rangeInput.clientWidth) * 100;
    rangeFiller.style.width = pc + '%';
    if (show_value) {
      show_value.innerText = rangeInput.value;
      show_value.style.left = pc + '%';
    }
  };

  if (show_value) {
    sherRange.onmouseenter = e => {
      show_value.style.display = 'block';
    };
    sherRange.onmouseleave = e => {
      show_value.style.display = 'none';
    };
    sherRange.appendChild(show_value);
  }
  
  sherRange.appendChild(rangeFill);
  sherRange.appendChild(rangeFiller);
  sherRange.appendChild(rangeInput);

  parent.appendChild(sherRange);
  return sherRange;
}