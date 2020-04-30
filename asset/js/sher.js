document.addEventListener('DOMContentLoaded', e => {
  let print = console.log;

  let playPauseBtn = document.querySelector('.play-pause i');
  let curTimeElm = document.querySelector('.current-time span');

  let seek = document.querySelector('.seek-bar');
  let speed = document.querySelectorAll('.speed-controler div');
  let volume = document.querySelectorAll('.volume-controler div');
  
  let togglePreview = document.querySelector('.toggle-preview i');

  let audio = document.querySelector('.audio');
  let mp3Input = document.querySelector('.load-mp3');
  let lrcInput = document.querySelector('.load-lrc');

  document.querySelector('.upload-song-icon i').onclick = e => mp3Input.click();
  document.querySelector('.upload-song-button').onclick = e => mp3Input.click();
  document.querySelector('.upload-lyric-icon i').onclick = e => lrcInput.click();
  document.querySelector('.upload-lyric-button').onclick = e => lrcInput.click();

  let seekInput = SherRangeInput(seek, 0, 0, 0.01, 0, false);
  let speedInput = SherRangeInput(speed[1], 0.25, 3, 0.01, 1);
  let volumeInput = SherRangeInput(volume[0], 0, 1, 0.01, 0.8);

  let creator = new SherLyricContainer(document.querySelector('.creator'), 'sher-focus', 'time-stamp', 'lyric');
  creator.lyricHTML = function(lrc, time) {
    return `<div><div class="time-stamp">${this.convertTime(time)}</div><div class="lyric">${lrc}</div></div>`;
  }
  let preview = new SherLyricContainer(document.querySelector('.preview'), 'sher-focus', 'time-stamp', 'lyric');
  preview.convertTime = function(timeStr) {
    timeStr = timeStr.replace(/(\[|\])/g, '').split(':');
    return parseInt(timeStr[0]) * 60 + parseFloat(timeStr[1]);
  }
  preview.lyricHTML = function(lrc, time) {
    return `<div><div class="lyric" time-stamp="${preview.convertTime(time)}">${lrc}</div></div>`;
  }

  speed[0].parentElement.onmouseenter = e => {
    speed[1].style.width = 0;
    speed[1].style.opacity = 1;
    let w = 0;
    let interval = setInterval(() => {
      if (w < 60) {
        speed[1].style.width = (w += 5) + '%';
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
    audio.playbackRate = 1;
    speedInput.value(1);
  }

  volume[0].parentElement.onmouseenter = e => {
    volume[0].style.width = 0;
    volume[0].style.opacity = 1;
    let w = 0;
    let interval = setInterval(() => {
      if (w < 60) {
        volume[0].style.width = (w += 5) + '%';
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
    audio.volume = 0.8;
    volumeInput.value(0.8);
  }




  mp3Input.onchange = e => {
    let file = e.target.files[0];
    if (file) {
      let reader = new FileReader();
      reader.onload = e => {
        audio.src = reader.result;
        document.querySelector('.song-title').innerText = file.name;
      };
      reader.readAsDataURL(file);
    }
  }
  audio.onloadedmetadata = e => {
    document.querySelector('.song-length span').innerText = creator.convertTime(audio.duration).replace(/(\[|\])/g, '');
    let sk = seekInput.querySelector('input');
    sk.max = audio.duration;
    audio.volume = volumeInput.value();
    audio.playbackRate = speedInput.value();
    playPauseBtn.className = 'fas fa-play';
  }
  audio.onended = e => {
    playPauseBtn.className = 'fas fa-play';
  }
  audio.ontimeupdate = e => {
    curTimeElm.innerText = creator.convertTime(audio.currentTime).replace(/(\[|\])/g, '');
    seekInput.value(audio.currentTime);

    if (preview.curElm) {
      for (let elm = preview.ctnElm.firstElementChild; elm.nextElementSibling; elm = elm.nextElementSibling) {
        if (elm.firstElementChild.getAttribute('time-stamp') <= audio.currentTime && audio.currentTime < elm.nextElementSibling.firstElementChild.getAttribute('time-stamp')) {
          preview.focus(elm);
          break;
        }
      }
      if (preview.ctnElm.lastElementChild.firstElementChild.getAttribute('time-stamp') <= audio.currentTime) {
        preview.focus(preview.ctnElm.lastElementChild);
      }
    }
  }

  
  seekInput.querySelector('input').oninput = e => {
    audio.currentTime = seekInput.value();
  }
  speedInput.querySelector('input').oninput = e => {
    audio.playbackRate = speedInput.value();
  }
  volumeInput.querySelector('input').oninput = e => {
    audio.volume = volumeInput.value();
  }




  lrcInput.onchange = e => {
    let file = e.target.files[0];
    if (file) {
      let reader = new FileReader();
      reader.onload = e => {
        let lrcs = reader.result.replace(/\[.*\]\s*\n?/gi, '');
        let newLineChr = String.fromCharCode(13);
        creator.ctnElm.innerHTML = '';
        lrcs.split('\n').forEach(lrc => {
          creator.addLyric(lrc == newLineChr ? '...' : lrc);
        });
        creator.focus(creator.ctnElm.firstElementChild);
      }
      reader.readAsText(file);
    }
  }


  creator.ctnElm.addEventListener('dblclick', e => {
    if (e.target.className == 'lyric') {
      e.target.setAttribute('contentEditable', true);
      e.target.addEventListener('focusout', e => {
        e.target.removeAttribute('contentEditable');
      });
      e.target.focus();
      creator.isEdit = true;
    }
  });
  document.onkeydown = e => {
    if (creator.isEdit && e.keyCode == 13) {
      let lrc = creator.curElm.querySelector('.lyric');
      lrc.removeAttribute('contentEditable');
      lrc.innerText = lrc.innerText.replace(/^[\.\s]*(.*?\.?)[\.\s]*$/, '$1');
      if (/^\W*$/i.test(lrc.innerText)) lrc.innerText = '...';
      creator.isEdit = false;
    } else {
      if (e.keyCode == 13 && creator.curElm && preview.ctnElm.style.display != 'block') {
        creator.saveTime(audio.currentTime);
        creator.focus(creator.curElm.nextElementSibling);
      } else if (e.key == 'h' && !creator.isEdit) {
        creator.focus(creator.ctnElm.firstElementChild);
      } else if (e.keyCode == 32) {
        e.preventDefault();
        togglePlay();
      } else if (e.keyCode == 37) {
        e.preventDefault();
        audioSeek(-2);
      } else if (e.keyCode == 39) {
        e.preventDefault();
        audioSeek(2);
      } else if (e.keyCode == 80) {
        togglePreview.click();
      }
    }
  }

  creator.ctnElm.addEventListener('click', e => {
    if (creator.curElm) {
      let time = preview.convertTime(creator.curElm.querySelector('.time-stamp').innerText);
      if (isFinite(time) && 0 <= time && time <= audio.duration) audio.currentTime = time;
    }
  });
  preview.ctnElm.addEventListener('click', e => {
    let elm = e.target.className == 'lyric' ? e.target : e.target.firstElementChild;
    elm = elm.getAttribute('time-stamp');
    if (isFinite(elm) && 0 <= elm && elm <= audio.duration) audio.currentTime = elm;
  });

  togglePreview.onclick = e => {
    if (!audio.paused) togglePlay();
    if (creator.ctnElm.style.display != 'none') {
      if (!creator.curElm) return;
      preview.ctnElm.innerHTML = '';
      Array.from(creator.ctnElm.children).forEach(elm => {
        preview.addLyric(elm.querySelector('.lyric').innerText, elm.querySelector('.time-stamp').innerText);
      });
      creator.ctnElm.style.display = 'none';
      preview.ctnElm.style.display = 'block';
      preview.focus(preview.ctnElm.firstElementChild);
      audio.currentTime = 0;
    } else {
      preview.ctnElm.style.display = 'none';
      creator.ctnElm.style.display = 'block';
      preview.ctnElm.innerHTML = '';
      preview.curElm = null;
    }
  }


  playPauseBtn.onclick = togglePlay;
  document.querySelector('.backward i').onclick = e => audioSeek(-2);
  document.querySelector('.forward i').onclick = e => audioSeek(2);

  function togglePlay() {
    if (audio.currentSrc) {
      if (audio.paused) {
        playPauseBtn.className = 'fas fa-pause';
        audio.play();
      } else {
        playPauseBtn.className = 'fas fa-play';
        audio.pause();
      }
    }
  }
  function audioSeek(s) {
    audio.currentTime -= -s;
  }
});