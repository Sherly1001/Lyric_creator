document.addEventListener('DOMContentLoaded', e => {
  let print = console.log;

  let playPauseBtn = document.querySelector('.play-pause i');
  let curTimeElm = document.querySelector('.current-time span');

  let seek = document.querySelector('.seek-bar');
  let speed = document.querySelectorAll('.speed-controler div');
  let volume = document.querySelectorAll('.volume-controler div');
  
  let togglePreview = document.querySelector('.toggle-preview i');
  let lrcEditCtn = document.querySelector('.lyric-edit');
  
  let addTi = document.querySelector('.add-song-name');
  let addAr = document.querySelector('.add-artist');

  let audio = document.querySelector('.audio');
  let mp3Input = document.querySelector('.load-mp3');
  let lrcInput = document.querySelector('.load-lrc');

  let mucis = {};
  mucis.ti = '';
  mucis.ar = '';
  mucis.ip = false;

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

  speed[0].parentElement.onmouseenter = e => speed[1].style.opacity = 1;
  speed[0].parentElement.onmouseleave = e => speed[1].style.opacity = 0;

  speed[0].onclick = e => {
    audio.playbackRate = 1;
    speedInput.value(1);
  }

  volume[0].parentElement.onmouseenter = e => volume[0].style.opacity = 1;
  volume[0].parentElement.onmouseleave = e => volume[0].style.opacity = 0;

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
        lrcEditCtn.style.display = 'grid';
        lrcInput.value = '';
      }
      reader.readAsText(file);
    }
  }


  creator.ctnElm.addEventListener('dblclick', e => {
    if (e.target.className == 'lyric') {
      e.target.setAttribute('contentEditable', true);
      e.target.addEventListener('focusout', e => {
        e.target.removeAttribute('contentEditable');
        e.target.innerText = e.target.innerText.replace(/^[\.\s]*(.*?\.?)[\.\s]*$/, '$1');
        if (/^\W*$/i.test(e.target.innerText)) e.target.innerText = '...';
      });
      e.target.focus();
      creator.isEdit = true;
    }
  });
  document.onkeydown = e => {
    if (creator.isEdit) {
      if (e.keyCode != 13) return;
      let lrc = creator.curElm.querySelector('.lyric');
      lrc.removeAttribute('contentEditable');
      lrc.innerText = lrc.innerText.replace(/^[\.\s]*(.*?\.?)[\.\s]*$/, '$1');
      if (/^\W*$/i.test(lrc.innerText)) lrc.innerText = '...';
      creator.isEdit = false;
    } else if (!mucis.ip) {
      if (e.keyCode == 13 && creator.curElm && preview.ctnElm.style.display != 'block') {
        saveTime();
      } else if (e.key == 'h') {
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
      } else if (e.keyCode == 75) {
        if (creator.curElm) creator.focus(creator.curElm.previousElementSibling);
      } else if (e.keyCode == 74) {
        if (creator.curElm) creator.focus(creator.curElm.nextElementSibling);
      } else if (e.keyCode == 65) {
        e.preventDefault();
        addLrc();
      } else if (e.ctrlKey && e.keyCode == 88) {
        delLrc();
      }
    } else {
      if (e.keyCode == 13) {
        mucisInfo();
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
      lrcEditCtn.style.display = 'none';
    } else {
      preview.ctnElm.style.display = 'none';
      creator.ctnElm.style.display = 'block';
      preview.ctnElm.innerHTML = '';
      preview.curElm = null;
      lrcEditCtn.style.display = 'grid';
    }
  }


  playPauseBtn.onclick = togglePlay;
  document.querySelector('.backward i').onclick = e => audioSeek(-2);
  document.querySelector('.forward i').onclick = e => audioSeek(2);
  document.querySelector('.save-lyric i').onclick = e => saveLrc();

  document.querySelector('.lyric-save-time-stamp').onclick =  e => saveTime();
  document.querySelector('.lyric-delete').onclick = e => delLrc();
  document.querySelector('.lyric-add').onclick = e => addLrc();

  let moreBtn = document.querySelector('.more-setting i');
  let morePanel = document.querySelector('.more-panel');
  let sherfcelm = document.querySelector('.sher-focus-out-elm');
  let help = document.querySelector('.help');
  moreBtn.onclick = e => {
    if (morePanel.style.top != '-9em') {
      morePanel.style.top = '-9em';
      moreBtn.style.transform = 'rotate(-30deg)';
      sherfcelm.style.display = 'block';
      help.style.top = '-100%';
    } else {
      morePanel.style.top = '150%';
      moreBtn.removeAttribute('style');
      sherfcelm.style.display = 'none';
    }
  }
  sherfcelm.onclick = e => {
    morePanel.style.top = '150%';
    moreBtn.removeAttribute('style');
    sherfcelm.style.display = 'none';
    mucisInfo();
    help.style.top = '-100%';
  }

  document.querySelector('.show-help').onclick = e => {
    morePanel.style.top = '150%';
    moreBtn.removeAttribute('style');
    showHelp();
  };
  document.querySelector('.help-button').onclick = showHelp;

  addTi.children[0].onclick = e => {
    addTi.style.left = '-100%';
    setTimeout(() => {
      addTi.children[1].focus();
      mucis.ip = true;
    }, 250);
  }
  addTi.children[1].addEventListener('focusout', mucisInfo);

  addAr.children[0].onclick = e => {
    addAr.style.left = '-100%';
    setTimeout(() => {
      addAr.children[1].focus();
      mucis.ip = true;
    }, 250);
  }
  addAr.children[1].addEventListener('focusout', mucisInfo);


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
  function saveLrc() {
    let filename = document.querySelector('.song-title').innerText;
    if (filename) {
      let lyric = `[ar:${mucis.ar}]\n[ti:${mucis.ti}]\n[length:${creator.convertTime(audio.duration)}]\n\n`;
      let txt = '';
      for (let i = creator.ctnElm.firstElementChild; i; i = i.nextElementSibling) {
        txt = i.querySelector('.lyric').innerText;
        lyric += `${i.querySelector('.time-stamp').innerText} ${txt == '...' ? '' : txt + ''}\n`;
      }
      saveAs(lyric, filename.replace(/^(.*)\..*$/, '$1.lrc'), 'text/plain');
    }
  }
  function saveAs(data, filename, type) {
    let file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) window.navigator.msSaveOrOpenBlob(file, filename);
    else {
      let a = document.createElement('a');
      a.href = URL.createObjectURL(file);
      a.download = filename;
      a.click();
    }
  }
  function addLrc() {
    creator.addLyric('', NaN, true);
  }
  function delLrc() {
    if (creator.curElm) {
      let delElm = creator.curElm;
      if (delElm.nextElementSibling) creator.focus(delElm.nextElementSibling);
      else if (delElm.previousElementSibling) creator.focus(delElm.previousElementSibling);
      else creator.curElm = null;
      delElm.remove();
      creator.isEdit = false;
    }
  }
  function saveTime() {
    if (creator.isEdit) {
      creator.curElm.removeAttribute('contentEditable');
      creator.isEdit = false;
    }
    creator.saveTime(audio.currentTime);
    creator.focus(creator.curElm.nextElementSibling);
  }
  function mucisInfo() {
    addTi.style.left = 0;
    mucis.ti = addTi.children[1].value;
    addAr.style.left = 0;
    mucis.ar = addAr.children[1].value;
    mucis.ip = false;
  }
  function showHelp() {
    sherfcelm.style.display = 'block';
    setTimeout(() => {
      help.style.top = '50%';
    }, 0);
  }
});