window.onload = () => {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./sw.js');
  }
    camStart();
}

// Override the function with all the posibilities
navigator.getUserMedia ||
    (navigator.getUserMedia = navigator.mozGetUserMedia ||
    navigator.webkitGetUserMedia || navigator.msGetUserMedia);
window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext;
var audioInput = null,
    realAudioInput = null,
    inputPoint = null;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var recIndex = 0;

var canvas;
var tempCanvas;
var tempCtx;
var index = 0;
var clearDisplay = 1;

var splash;
var button;
var button1;
var button2;
var button3;
var btnBack;
var settings;
var panel;
var panelvisible = false;
var colPick;
var progress;
var vol1;
var vol2;
var aspect;
var nAgt = navigator.userAgent;
var fcol;
var bcol;
var doingRainbow = "1";
var audiorunning = false;
var nextIndex = -1;
function convertToMono( input ) {
  var splitter = audioContext.createChannelSplitter(2);
  var merger = audioContext.createChannelMerger(2);

  input.connect( splitter );
  splitter.connect( merger, 0, 0 );
  splitter.connect( merger, 0, 1 );
  return merger;
}

function cancelAnalyserUpdates() {
  window.cancelAnimationFrame( rafID );
  rafID = null;
}

var scale;
var update = 0;
var volumeList = [];
var colorList = [];

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  if (doingRainbow == "1") {
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
  }
  else
    color = fcol.style.backgroundColor;
  return color;
}

var count = 0;
var current = 0;
var smoothMax = 0;
var scaleMax = 0;

function MakeColorList() {
  for (var i = 0; i < 20; i++)
    colorList[i] = getRandomColor();
}

function drawStar(context, xCenter, yCenter, nPoints, outerRadius, innerRadius) {
    context.beginPath();
    for (var ixVertex = 0; ixVertex <= 2 * nPoints; ++ixVertex) {
        var angle = ixVertex * Math.PI / nPoints - Math.PI / 2;
        var radius = ixVertex % 2 == 0 ? outerRadius : innerRadius;
        context.lineTo(xCenter + radius * Math.cos(angle),  yCenter + aspect *radius * Math.sin(angle));
    }
}

var iOS = false;
function updateAnalysers(time) {
  if (!analyserContext) {
    canvas = document.getElementById("analyser");
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    analyserContext = canvas.getContext('2d');
    if (!iOS)
      scale = analyserNode.context.sampleRate/(2.7*44100); // comment out for iOS
    if (scale < .1)
    		scale = .5;
    		// create a temp canvas we use for copying and scrolling
     tempCanvas = document.createElement("canvas"),
     tempCtx = tempCanvas.getContext("2d");
     tempCanvas.width=canvasWidth;
     tempCanvas.height=canvasHeight;
     hScale = canvasHeight/256;
  }
  count ++;

  var SPACING = 3;
  var BAR_WIDTH = 10;
  var numBars = Math.round(canvasWidth / SPACING);
  var max = 0;
  if (!iOS) {
     var freqByteData = new Uint8Array(analyserNode.frequencyBinCount); // comment out for iOS

    // first get volume into max;
     analyserNode.getByteTimeDomainData(freqByteData); //waveform data // comment out for iOS
    for (var i = 0; i < freqByteData.length/2; ++i) { // comment out for iOS
        if (freqByteData[i] > max) // comment out for iOS
          max = freqByteData[i]; // comment out for iOS
    }
    max = max - 127;
  }
  smoothMax = (max + 7*smoothMax)/8;
  progress.value = smoothMax;
  scaleMax = Math.max((max-Math.min(vol1.value,vol2.value))*100/Math.abs(vol2.value-vol1.value),1);
  if (scaleMax > 100)
    scaleMax = 100;
  if (iOS)
    scaleMax = 50; //pass in value for iOS
console.log(max);
  switch (index) {
    case 1 : // star
      if (count == 1) {
        analyserContext.lineWidth = 1;
        if (colorList.length == 0) {
          MakeColorList();
        }
        if (scaleMax <= 1) {
          scaleMax = 0;
          MakeColorList();
        }
        analyserContext.fillStyle = bcol.style.backgroundColor;
        analyserContext.fillRect(0, 0, canvasWidth, canvasHeight);
        var j = 0;
        for (var i = scaleMax*canvasWidth/100; i > 0; i -= canvasHeight/10) {
          analyserContext.beginPath();
          analyserContext.fillStyle = colorList[j];
          analyserContext.strokeStyle = colorList[j];

          drawStar(analyserContext, canvasWidth/2, canvasHeight*.55, 5, i*.53, i/7);

          analyserContext.fill();
          analyserContext.stroke();
          j++;
         }
      }
      else
        if (count > 5)
          count = 0;
      break;
    case 2 : // circle
     if (count == 1) {
        analyserContext.strokeStyle = 'black';
        analyserContext.lineWidth = 2;
        analyserContext.fillStyle = bcol.style.backgroundColor;
        analyserContext.fillRect(0, 0, canvasWidth, canvasHeight);
        for (var i = scaleMax*canvasWidth/100; i > 0; i -= canvasWidth/20) {
        analyserContext.beginPath();
         analyserContext.fillStyle = getRandomColor();
        if (nAgt.indexOf('Chrome') != -1) {
            analyserContext.ellipse(canvasWidth/2, canvasHeight/2, i/2, i*aspect/2,0,0,Math.PI*2,true);
        }
        else {
            analyserContext.arc(canvasWidth/2, canvasHeight/2, i*aspect/2,0,Math.PI*2);
        }
         analyserContext.closePath();
         analyserContext.fill();
        analyserContext.stroke();
        }
      }
      else
        if (count > 5)
          count = 0;
      break;
      break;
    case 3 : //triangle
      if (count == 1) {
        analyserContext.strokeStyle = 'black';
        analyserContext.lineWidth = 2;
        if (colorList.length == 0) {
          MakeColorList();
        }
        if (scaleMax <= 1) {
          scaleMax = 0;
          MakeColorList();
        }
        analyserContext.fillStyle = bcol.style.backgroundColor;
        analyserContext.fillRect(0, 0, canvasWidth, canvasHeight);
        var j = 0;
        for (var i = scaleMax*canvasHeight/100; i > 0; i -= canvasHeight/20) {
          analyserContext.beginPath();
          analyserContext.fillStyle = colorList[j];
          analyserContext.moveTo(0,canvasHeight);
          analyserContext.lineTo(canvasWidth/2, canvasHeight-i);
          analyserContext.lineTo(canvasWidth,canvasHeight);
          analyserContext.fill();
          analyserContext.stroke();
          j++;
        }
      }
      else
        if (count > 5)
          count = 0;
      break;
    case 4 :// rectangles
      if (count == 1) {
        analyserContext.strokeStyle = 'black';
        analyserContext.lineWidth = 2;
        analyserContext.fillStyle = bcol.style.backgroundColor;
        analyserContext.fillRect(0, 0, canvasWidth, canvasHeight);
        analyserContext.beginPath();
        for (var i = scaleMax*canvasWidth/100; i > 0; i -= canvasWidth/20) {
         analyserContext.fillStyle = getRandomColor();
         analyserContext.fillRect((canvasWidth-i)/2, (canvasHeight-i*aspect)/2, i, i*aspect);
        }
        analyserContext.stroke();
      }
      else
        if (count > 5)
          count = 0;
      break;
    case 5 :
      var colours = [ "rgba(0,255,255", "rgba(0,255,255", "rgba(0,0,255", "rgba(255,0,0", "rgba(0,255,0", "rgba(0,0,255", "rgba(255,0,0", "rgba(255,255,0", "rgba(0,0,255", "rgba(0,255,0", "rgba(255,255,0", "rgba(0,0,255", "rgba(0,255,255", "rgba(255,0,0", "rgba(0,0,255", "rgba(255,255,0" ];
      var m = 0.2 + scaleMax/140;
      var m1 = 1.0 - scaleMax/120;
      if (count == 1) {
        if (colorList.length == 0) {
          MakeColorList();
        }
        analyserContext.fillStyle = bcol.style.backgroundColor;
        analyserContext.fillRect(0, 0, canvasWidth, canvasHeight);
        analyserContext.beginPath();
        var c = 0;
        var useM = true;
        for (var x = 0; x < 4; x++)
          for (var y = 0; y < 4; y++ ) {
            if (useM)
              analyserContext.fillStyle = colours[c] + "," + m + ")";
            else
              analyserContext.fillStyle = colours[c] + "," + m1 + ")";
            analyserContext.fillRect(x * canvasWidth/4, y * canvasHeight/4, canvasWidth/4.1, canvasHeight/4.1);
            c++;
            useM = !useM;
            }
            analyserContext.stroke();
      }
      else
        if (count > 5)
          count = 0;
      break;
    case 6 :
     if (count == 1) {
        analyserContext.fillStyle = bcol.style.backgroundColor;
        analyserContext.fillRect(0, 0, canvasWidth, canvasHeight);
        analyserContext.lineCap = 'round';
        analyserContext.lineWidth = canvasWidth/60;
        if (volumeList.length > 60) {
          volumeList.shift();
          colorList.shift();
        }
        volumeList[volumeList.length] = scaleMax;
        colorList[colorList.length] = getRandomColor();
        for (var i = 0; i < 60; ++i) {
          analyserContext.beginPath();
          analyserContext.strokeStyle = colorList[i];
          analyserContext.moveTo(i*analyserContext.lineWidth, canvasHeight/2-volumeList[i]*canvasHeight/256);
          analyserContext.lineTo(i*analyserContext.lineWidth, canvasHeight/2+volumeList[i]*canvasHeight/256);
          analyserContext.stroke();
        }
      }
      else
        if (count > 5)
          count = 0;
      break;
    case 7 : // volume history
      if (count == 1) {
        analyserContext.fillStyle = bcol.style.backgroundColor;
        analyserContext.fillRect(0, 0, canvasWidth, canvasHeight);
        analyserContext.beginPath();

        if (volumeList.length > canvasWidth/30) {
          volumeList.shift();
          colorList.shift();
        }
        volumeList[volumeList.length] = scaleMax;
        colorList[colorList.length] = getRandomColor();
        for (var i = 0; i < canvasWidth/31; ++i) {
        //  analyserContext.lineTo(i, canvasHeight-(volumeList[i]*canvasHeight/128));

          analyserContext.fillStyle = colorList[i]; //"hsl( " + Math.round((i*360)/canvasWidth) + ", 100%, 50%)";
          analyserContext.fillRect(i*30, canvasHeight, 24, -(volumeList[i]*canvasHeight/128));
        }
        analyserContext.stroke();
      }
      else
        if (count > 5)
          count = 0;
      break;
    case 8 :
      if (count == 1) {
        analyserContext.fillStyle = bcol.style.backgroundColor;
        analyserContext.fillRect(0, 0, canvasWidth, canvasHeight);
        analyserContext.lineCap = 'round';
        analyserContext.lineWidth = canvasWidth/60;
        if (volumeList.length > 12) {
          volumeList.shift();
          colorList.shift();
        }

        volumeList[volumeList.length] = scaleMax;
        colorList[colorList.length] = getRandomColor();
        for (var i = 0; i < 24; ++i) {
          analyserContext.strokeStyle = 'rgb(' + i*4 + ',' + i*4 + ',' + i*4 + ')';
          analyserContext.beginPath();
          analyserContext.moveTo(i*analyserContext.lineWidth, 1+canvasHeight/2);
          analyserContext.lineTo(i*analyserContext.lineWidth, canvasHeight/2);
          analyserContext.stroke();

          analyserContext.beginPath();
          analyserContext.moveTo((59-i)*analyserContext.lineWidth, 1+canvasHeight/2);
          analyserContext.lineTo((59-i)*analyserContext.lineWidth, canvasHeight/2);
          analyserContext.stroke();
        }
        for (var i = 0; i < 12; ++i) {

          analyserContext.beginPath();
          analyserContext.strokeStyle = colorList[i];

          analyserContext.moveTo((24+i)*analyserContext.lineWidth, canvasHeight/2-volumeList[i]*canvasHeight/256);
          analyserContext.lineTo((24+i)*analyserContext.lineWidth, canvasHeight/2+volumeList[i]*canvasHeight/256);
          analyserContext.stroke();
        }
      }
      else
        if (count > 5)
          count = 0;
      break;
  }
  clearDisplay = 0;
  rafID = window.requestAnimationFrame( updateAnalysers );
}


function gotStream(stream) {
audiorunning = true;
  inputPoint = audioContext.createGain();

  // Create an AudioNode from the stream.
  realAudioInput = audioContext.createMediaStreamSource(stream);
//  audioInput = realAudioInput;
  realAudioInput.connect(inputPoint);

  //    audioInput = convertToMono( input );

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 1024; //2048;
  inputPoint.connect( analyserNode );

  //    audioRecorder = new Recorder( inputPoint );

  //    zeroGain = audioContext.createGain();
  //    zeroGain.gain.value = 0.0;
  //    inputPoint.connect( zeroGain );
  //    zeroGain.connect( audioContext.destination );
    if (nextIndex > 0) {
      index = nextIndex;
     setTimeout(restart, 500);
}
    updateAnalysers();
}
 function restart() {
    Action(index);
 }

function initAudio() {
  if (!navigator.getUserMedia)
      navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  if (!navigator.cancelAnimationFrame)
      navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
  if (!navigator.requestAnimationFrame)
      navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

  navigator.getUserMedia({audio:true}, gotStream, function(e) {
      alert('Error getting audio');
      console.log(e);
  });

  if (iOS)
    updateAnalysers(); // add in for iOS
}

function MonitorKeyUp(e) {
  if (!e) e=window.event;
    if (e.keyCode == 32 || e.keyCode == 49)
        Action(4);
    if (e.keyCode == 50)
		Action(2);
    if (e.keyCode == 51  || e.keyCode == 13)
		Action(3);
    if (e.keyCode == 52)
		Action(1);
   return false;
}

var mouseState = 0;
function MonitorMouseDown(e) {
  if (!e) e=window.event;
    if (e.button == 0) {
        mouseState = 1;
        	mouseX =e.clientX/canvas.scrollWidth;
   		mouseY =1.0 - e.clientY/canvas.scrollHeight;
     }
  return false;
}

function MonitorMouseUp(e) {
  if (!e) e=window.event;
    if (e.button == 0) {
        mouseState = 0;
     }
  return false;
}

function slideTo(el, left) {
  var steps = 10;
  var timer = 25;
  var elLeft = parseInt(el.style.left) || 0;
  var diff = left - elLeft;
  var stepSize = diff / steps;
  console.log(stepSize, ", ", steps);

  function step() {
      elLeft += stepSize;
      el.style.left = elLeft + "vw";
      if (--steps) {
          setTimeout(step, timer);
      }
  }
  step();
}


StoreValue = function (key, value) {
  if (window.localStorage) {
     window.localStorage.setItem(key, value);
  }
};

RetrieveValue = function(key, defaultValue) {
  var got;
  try {
     if (window.localStorage) {
       got = window.localStorage.getItem(key);
       if (got == 0) {
                      return got;
       }
       if (got == "") {
                      return got;
       }
       if (got) {
                      return got;
       }
       return defaultValue;
     }
     return defaultValue;
  } catch (e) {
     return defaultValue;
  }
};
var chromeOS = false; // this checks for Chrome Operating system /(CrOS)/.test(navigator.userAgent);
var doingFore = false;
function camStart() {
  var foreground = document.querySelector('foreground');
  var rainbow = document.querySelector('rainbow');
  var bground = document.querySelector('background');
  fcol = document.querySelector('fcol');
  bcol = document.querySelector('bcol');

  splash  = document.querySelector('splash');
  panel  = document.querySelector('panel');
  settings  = document.querySelector('settings');
  button = document.querySelector('button');
  button1 = document.querySelector('button1');
  button2 = document.querySelector('button2');
  button3 = document.querySelector('button3');
  button4 = document.querySelector('button4');
  button5 = document.querySelector('button5');
  button6 = document.querySelector('button6');
  button7 = document.querySelector('button7');
  btnBack = document.querySelector('back');
  canvas = document.getElementById("analyser");
  colPick = document.getElementById('myColor');
  progress = document.getElementById('progress');
    
  panel.style.left = "130vw";
  slideTo(panel, 130);
  settings.style.left = "89vw";

  btnBack.onclick = function(e) {
    panel.hidden = false;
    settings.hidden = false;
    splash.hidden = false;
    button.hidden = false;
    button1.hidden = false;
    button2.hidden = false;
    button3.hidden = false;
    button4.hidden = false;
    button5.hidden = false;
    button6.hidden = false;
    button7.hidden = false;
    btnBack.hidden = true;
  }

 	button.onmousedown = function(e) {
   	Action(1);
  }
  button1.onmousedown = function(e) {
   	Action(2);
  }
  button2.onmousedown = function(e) {
   	Action(3);
  }
  button3.onmousedown = function(e) {
   	Action(4);
  }
  button4.onmousedown = function(e) {
   	Action(5);
  }
  button5.onmousedown = function(e) {
   	Action(6);
  }
  button6.onmousedown = function(e) {
   	Action(7);
  }
  button7.onmousedown = function(e) {
   	Action(8);
  }
  canvas.onkeyup = MonitorKeyUp;
  canvas.onmousedown = MonitorMouseDown;
  canvas.onmouseup = MonitorMouseUp;
  fcol.style.backgroundColor = "#FFFF00";
  bcol.style.backgroundColor = "#000000";

  progress.style.position = "absolute";
  progress.style.height = "1vh";
  progress.style.width = "12vw";
  progress.style.left = "6.5vw";
  progress.style.top = "15vh";

  vol1 = document.createElement("INPUT");
  vol1.setAttribute("type", "range");
  vol1.style.position = "absolute";
  vol1.style.height = "8vh";
  vol1.style.width = "12vw";
  vol1.style.left = "6.5vw";
  vol1.style.top = "8.5vh";
  vol1.value = 25;
  vol1.min = 1;

  vol2 = document.createElement("INPUT");
  vol2.setAttribute("type", "range");
  vol2.style.position = "absolute";
  vol2.style.height = "8vh";
  vol2.style.width = "12vw";
  vol2.style.left = "6.5vw";
  vol2.style.top = "14.5vh";
  vol2.value = 75;
  vol2.min = 1;

  colPick.value ="#FF8040";
  colPick.style.position = "absolute";
  colPick.style.height = "3vh";
  colPick.style.width = "3vw";
  colPick.style.left = "11vw";
  colPick.style.top = "33vh";

  panel.appendChild(vol1);
  panel.appendChild(vol2);
  panel.appendChild(colPick);
  panel.appendChild(progress);
  panel.appendChild(foreground);
  panel.appendChild(rainbow);
  panel.appendChild(bground);
  panel.appendChild(fcol);
  panel.appendChild(bcol);

  if (chromeOS) {
    chrome.storage.local.get(null, function (result) { // recover stored value
      if (result.vol1 == undefined) { // initial set up after first loaded
        vol1.value = 1;
        vol2.value = 50;
        bcol.style.backgroundColor = '#000000';
        fcol.style.backgroundColor = '#00FFFF';
        fcol.style.backgroundImage="url(images/rainbow.png)";
      }
      else {
        vol1.value = Math.abs(result.vol1);
        if (result.vol1 < 0) {
          fcol.style.backgroundImage="url(images/rainbow.png)";
        }
        else
          doingRainbow = "0";
        vol2.value = result.vol2;
        fcol.style.backgroundColor = result.foreground;
        bcol.style.backgroundColor = result.background;
      }
     });
  }
  else {
    vol1.value = RetrieveValue("vol1", 0);
    vol2.value = RetrieveValue("vol2", 50);
    doingRainbow = RetrieveValue("doingRainbow", "1");
    bcol.style.backgroundColor = RetrieveValue("back", 0);
    fcol.style.backgroundColor = RetrieveValue("fore", "rgb(255,255,0)");
    if (doingRainbow == "1")
        fcol.style.backgroundImage="url(images/rainbow.png)";
    else
        fcol.style.backgroundImage=null;
  }

  settings.onclick = function(e) {
    startAudio();
    if (panelvisible) { // save stored values
      slideTo(panel, 130);
      slideTo(settings,89);
      if (chromeOS) {
        if (vol1.value < 1)
          vol1 = 1;
        if (doingRainbow == "1")
          chrome.storage.local.set({'vol1': -vol1.value});
        else
          chrome.storage.local.set({'vol1': vol1.value});
        chrome.storage.local.set({'vol2': vol2.value});
        chrome.storage.local.set({'foreground': fcol.style.backgroundColor});
        chrome.storage.local.set({'background': bcol.style.backgroundColor});
      }
    else {
     // document.cookie="vol1="+vol1.value;
    // checkCookie();
    StoreValue("vol1", vol1.value);
    StoreValue("vol2", vol2.value);
    StoreValue("doingRainbow", doingRainbow);
    StoreValue("back", bcol.style.backgroundColor);
    StoreValue("fore", fcol.style.backgroundColor);
  }

    }
    else {
      slideTo(panel, 75);
      slideTo(settings, 78);
    }
    colPick.color.hidePicker();
    panelvisible = !panelvisible;
  }

  bground.onclick = function(e) {
    doingFore = false;
    colPick.color.showPicker();
  }

  foreground.onclick = function(e) {
    doingFore = true;
    colPick.color.showPicker();
  }

  rainbow.onclick = function(e) {
    fcol.style.backgroundImage="url(images/rainbow.png)";
    colPick.color.hidePicker();
    doingRainbow = "1";
  }

  colPick.onchange = function(e) {
      if (doingFore) {
        fcol.style.backgroundColor = '#' + colPick.value;
        fcol.style.backgroundImage=null;
        doingRainbow = "0";
      }
      else
        bcol.style.backgroundColor = '#'+colPick.value;
  }

  panel.onclick = function(e) {
  }

}

function startAudio()
{
    if (audioContext == null) {
    audioContext = new AudioContext();
    initAudio();
    }
}

function Action(i){
      nextIndex = i;
    startAudio();
  panel.style.left = "130vw";
  panelvisible = false;
  settings.hidden = true;
  settings.style.left = "89vw";
  splash.hidden = true;
  button.hidden = true;
  button1.hidden = true;
  button2.hidden = true;
  button3.hidden = true;
  button4.hidden = true;
  button5.hidden = true;
  button6.hidden = true;
  button7.hidden = true;
  btnBack.hidden = false;
  clearDisplay = 1;

  volumeList.length = 0;
  colorList.length = 0;
  aspect = canvasHeight/canvasWidth;

    if (!audiorunning)
        return;

  index = i;
}

function continueExecution()
{
  //analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
//  aspect = canvasHeight/canvasWidth;
}
