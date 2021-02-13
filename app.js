const { } = new class {
  constructor() {
    this.#init();
  }

  #init() {
    this.#addElementsOnPage();
    this.#drawAudioVisualizer();
  }

  #addElementsOnPage() {
    this.canvas = document.createElement('canvas')
    this.link = document.createElement('link');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.style.position = 'fixed';
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;
    this.link.rel = 'stylesheet';
    this.link.href = 'style.css';

    document.head.appendChild(this.link);
    document.body.appendChild(this.canvas);
  }

  #drawAudioVisualizer() {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      navigator.mediaDevices
        .getUserMedia({
          audio: {
            deviceId: devices[1].deviceId
          }
        })
      .then(stream => {
        const audioCtx = new AudioContext();
        this.audioAnalyser = audioCtx.createAnalyser();
        const audioCtxSource = audioCtx.createMediaStreamSource(stream);
        audioCtxSource.connect(this.audioAnalyser);
        this.audioAnalyser.connect(audioCtx.destination);

        this.dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
         
        this.barWidth = (this.WIDTH / this.bufferLength) * 1.5;
        this.barHeight = 0;
    
        this.hueShifting = 0; 

        this.#renderFrame();
      })
    })
 
    this.xRect = this.yRect = 0;
  }

  #renderFrame = _ => {
    this.audioAnalyser.getByteFrequencyData(this.dataArray);
    this.ctx.clearRect(0, 0, innerWidth, innerHeight);

    let radius = 190 / 1.4, bars = 100, strokeStyle = '#0062ff';
    
    this.ctx.beginPath();
    this.ctx.arc(innerWidth / 2, innerHeight / 2, radius, 0, 2 * Math.PI);
    this.ctx.strokeStyle = strokeStyle;
    this.ctx.stroke();

    for (let i = 0; i < bars; i++) {
      const radians = (Math.PI * 2) / bars;
      const barHeight = this.dataArray[i] * .5;

      const x = innerWidth / 2 + Math.cos(radians * i + this.hueShifting) * radius;
      const y = innerHeight / 2 + Math.sin(radians * i + this.hueShifting) * radius;

      const x1 = innerWidth / 2 + Math.cos(radians * i + this.hueShifting) * (radius + barHeight);
      const y1 = innerHeight / 2 + Math.sin(radians * i + this.hueShifting) * (radius + barHeight);
       
      this.ctx.strokeStyle = `hsl(${i * 3.6}, 100%, 50%)`;

      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x1, y1);
      this.ctx.stroke();
    }
    
    this.hueShifting += .01;

    if (this.hueShifting > 360) {
      this.hueShifting = 0;
    }

    requestAnimationFrame(this.#renderFrame);
  }
}
