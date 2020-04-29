class SherLyricContainer {
  constructor(ctnElm, focusCss, timeCss, lyricCss) {
    this.ctnElm = ctnElm;
    this.curElm = null;
    this.fcsCls = focusCss;
    this.timeCss = timeCss;
    this.lyricCss = lyricCss; 
    this.isEdit = false;

    this.ctnElm.onclick = e => {
      if (!this.curElm) return;
      let i = e.path.indexOf(this.ctnElm);
      if (i < 1) return;
      this.focus(e.path[i - 1]);
    }
    document.addEventListener('keydown', e => this.onkeydown(e));
  }
  addLyric(lrc, time, insert = false) {
    if (this.curElm) {
      if (insert) {
        this.curElm.insertAdjacentHTML('afterend', this.lyricHTML(lrc, time));
        this.focus(this.curElm.nextElementSibling);
      } else {
        this.ctnElm.insertAdjacentHTML('beforeend', this.lyricHTML(lrc, time));
      }
    } else {
      this.ctnElm.innerHTML = this.lyricHTML(lrc, time);
      this.focus(this.ctnElm.firstElementChild);
    }
    if (insert) {
      let editElm = this.curElm.querySelector(`.${this.lyricCss}`);
      editElm.setAttribute('contentEditable', true);
      editElm.addEventListener('focusout', e => this.onfocusout(e));
      editElm.focus();
      this.isEdit = true;
    }
  }


  onfocusout(e) {
    this.isEdit = false;
    e.target.removeAttribute('contentEditable');
  }
  onkeydown(e) {
    if (!this.isEdit) {
      if (e.keyCode == 38 && this.curElm) {
        e.preventDefault();
        this.focus(this.curElm.previousElementSibling);
      } else if (e.keyCode == 40 && this.curElm) {
        e.preventDefault();
        this.focus(this.curElm.nextElementSibling);
      }
    } else {
      if (e.keyCode == 13)  {
        e.preventDefault();
        this.curElm.querySelector(`.${this.lyricCss}`).removeAttribute('contentEditable');
        this.isEdit = false;
      }
    }
  }
  saveTime(time) {
    if (this.curElm) {
      this.curElm.querySelector(`.${this.timeCss}`).innerText = this.convertTime(time);
    }
  }
  focus(elm) {
    if (!elm || elm === this.curElm) return;
    if (this.curElm) this.curElm.removeAttribute('class');
    this.curElm = elm;
    this.curElm.className = this.fcsCls;
    this.ctnElm.scrollTop = this.curElm.offsetTop - this.ctnElm.clientHeight / 2 + this.curElm.clientHeight;
  }
  lyricHTML(lrc, time) {
    return `<div><div>${time}</div><div>${lrc}</div></div>`;
  }
  convertTime(time) {
    if (!isFinite(time)) return '[--:--.--]';
    let m = parseInt(time / 60);
    let s = parseInt(time % 60);
    let u = parseInt((time % 60 + 0.005) * 100 % 100);
    return `[${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}.${u < 10 ? '0' + u : u}]`;
  }
}