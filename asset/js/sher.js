document.addEventListener('DOMContentLoaded', e => {
  let print = console.log;

  let seek = document.querySelector('.seek-bar');
  let speed = document.querySelectorAll('.speed-controler div');
  let volume = document.querySelectorAll('.volume-controler div');

  let seekInput = SherRangeInput(seek, 0, 100, 0.01, 0, false);
  let speedInput = SherRangeInput(speed[1], 0.25, 3, 0.01, 1);
  let volumeInput = SherRangeInput(volume[0], 0, 1, 0.01, 0.8);

  let creator = new SherLyricContainer(document.querySelector('.creator'), 'sher-focus', 'time-stamp', 'lyric');
  creator.lyricHTML = function(lrc, time) {
    return `<div><div class="time-stamp">${this.convertTime(time)}</div><div class="lyric">${lrc}</div></div>`;
  }
  let preview = new SherLyricContainer(document.querySelector('.preview'), 'sher-focus', 'time-stamp', 'lyric');
  preview.lyricHTML = function(lrc, time) {
    return `<div><div class="time-stamp">${time}</div><div class="lyric">${lrc}</div></div>`;
  }

  speed[0].parentElement.onmouseenter = e => {
    speed[1].style.width = 0;
    speed[1].style.opacity = 1;
    let w = 0;
    let interval = setInterval(() => {
      if (w < 60) {
        speed[1].style.width = ++w + '%';
      } else {
        clearInterval(interval);
      }
    });
  }
  speed[0].parentElement.onmouseleave = e => {
    speed[1].style.opacity = 0;
    speed[1].style.width = 0;
  }
  speed[0].onclick = e => {
    speedInput.updateRange(1);
  }

  volume[0].parentElement.onmouseenter = e => {
    volume[0].style.width = 0;
    volume[0].style.opacity = 1;
    let w = 0;
    let interval = setInterval(() => {
      if (w < 60) {
        volume[0].style.width = ++w + '%';
      } else {
        clearInterval(interval);
      }
    });
  }
  volume[0].parentElement.onmouseleave = e => {
    volume[0].style.opacity = 0;
    volume[0].style.width = 0;
  }
  volume[1].onclick = e => {
    volumeInput.updateRange(0.8);
  }
});