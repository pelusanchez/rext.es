let lastClick = Date.now();
export const dblClick = (callback: any) => {
  const now = Date.now();
  if (now - lastClick < 200) {
    callback();
  }
  lastClick = now;
}

let lastDelta = Date.now();
export const deltaSpeed = (delta: number): number => {
  const now = Date.now();
  let speed = 200 / (now - lastDelta);
  if (speed < 1) {
    speed = 1;
  }
  lastDelta = now;
  const direction = (delta > 0) ? -1 : 1;
  return direction * speed;
}
