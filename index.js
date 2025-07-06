const IMAGE_WIDTH = 578; // 428px image + 150px gap
const NUM_UNIQUE_IMAGES = 3;
const LOOP_WIDTH = IMAGE_WIDTH * NUM_UNIQUE_IMAGES;
const reelOffset = (700 - 428) / 2; // center 428px image in 700px wrapper
const positions = {};

const reelRows = [
  { id: "top-row", speed: -10, targetSpeed: 0, stopping: false, slowingDown: false, shaking: false, shakeCount: 0, finalPosition: 0},
  { id: "middle-row", speed: 10, targetSpeed: 0, stopping: false, slowingDown: false, shaking: false, shakeCount: 0, finalPosition: 0},
  { id: "bottom-row", speed: -9, targetSpeed: 0, stopping: false, slowingDown: false, shaking: false, shakeCount: 0, finalPosition: 0},
];

const loop = document.getElementById('loop');
const spin = document.getElementById('spin');
const win = document.getElementById('win');
const lose = document.getElementById('lose');
const select = document.getElementById('select');
const stop = document.getElementById('stop');

let reelsStopped = 0;

function animate() {
  const now = Date.now();
  

  for (const row of reelRows) {
    const reel = document.getElementById(row.id);
    if (!(row.id in positions)) positions[row.id] = 0;

    if (row.stopping || row.slowingDown || row.shaking) {
      if (row.stopping && !row.slowingDown) {
        if (Math.abs(row.speed) > 2) {
          row.speed *= 0.92;
        } else {
          const currentPos = positions[row.id];
          const remainder = currentPos % IMAGE_WIDTH;
          row.finalPosition = currentPos - remainder;
          row.slowingDown = true;
          row.stopping = false;
        }
      } else if (row.slowingDown) {
        const distance = row.finalPosition - positions[row.id];
        if (Math.abs(distance) > 5) {
          positions[row.id] += distance * 0.3;
        } else {
          positions[row.id] = row.finalPosition;
          row.slowingDown = false;
          row.shaking = true;
          row.shakeCount = 0;
        }
      } else if (row.shaking) {
        row.shakeCount++;
        const shakeIntensity = Math.max(0, 8 - row.shakeCount);
        const shakeOffset = Math.sin(row.shakeCount * 1.5) * shakeIntensity;
        
        if (row.shakeCount < 15) {
          positions[row.id] = row.finalPosition + shakeOffset;
        } else {
          positions[row.id] = row.finalPosition;
          row.shaking = false;
          row.speed = 0;
          reelsStopped++;
          
          stop.currentTime = 0;
          stop.play();
          
          if (reelsStopped === reelRows.length) {
            spin.pause();
            setTimeout(() => checkForMatch(), 500);
          }
        }
      }
    }

    if (!row.stopping && !row.slowingDown && !row.shaking) {
      positions[row.id] += row.speed;
    } else if (row.stopping && !row.slowingDown) {
      positions[row.id] += row.speed;
    }

    if (positions[row.id] <= -LOOP_WIDTH) {
      positions[row.id] += LOOP_WIDTH;
    } else if (positions[row.id] > 0) {
      positions[row.id] -= LOOP_WIDTH;
    }

    reel.style.transform = `translateX(${positions[row.id] + reelOffset}px)`;
  }

  requestAnimationFrame(animate);
}

window.addEventListener("DOMContentLoaded", event => {
  loop.volume = 0.2;
  spin.volume = 0.2;
  win.volume = 0.3;
  lose.volume = 0.3;
  select.volume = 0.3;
  stop.volume = 0.3;

  loop.play();
  spin.play();

  animate();
});

document.addEventListener("keydown", event => {
  if (event.code === "Space") {
    if (reelsStopped < reelRows.length) {
      const row = reelRows[reelsStopped];
      row.stopping = true;

      select.currentTime = 0;
      select.play();
    } else {
      reelsStopped = 0;
      
      for (const row of reelRows) {
        row.stopping = false;
        row.slowingDown = false;
        row.shaking = false;
        row.shakeCount = 0;
      }

      reelRows[0].speed = -10;
      reelRows[1].speed = 10;
      reelRows[2].speed = -9;

      spin.currentTime = 0;
      spin.play();
    }
  }
});

function checkForMatch() {
  const visibleImages = [];
  
  for (const row of reelRows) {
    const normalizedPosition = Math.abs(positions[row.id]) % LOOP_WIDTH;
    const imageIndex = Math.floor(normalizedPosition / IMAGE_WIDTH);
    visibleImages.push(imageIndex);
  }
  
  const firstImage = visibleImages[0];
  const isMatch = visibleImages.every(image => image === firstImage);
  
  if (isMatch) {
    win.currentTime = 0;
    win.play();
  } else {
    lose.currentTime = 0;
    lose.play();
  }
}
