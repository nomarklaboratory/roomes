export class WalkInput {
  keys = new Set<string>();
  yaw = 0;
  pitch = 0;
  reset = 0;
  locked = false;

  recenter() {
    this.reset++;
  }

  resetPose(yaw: number, pitch = -0.24) {
    this.yaw = yaw;
    this.pitch = pitch;
  }

  look(x: number, y: number) {
    if (this.locked) return;
    this.yaw -= x * 0.005;
    this.pitch = Math.max(-1.1, Math.min(1.1, this.pitch - y * 0.004));
  }
}

export const newWalkInput = () => new WalkInput();

const keyDirections: Record<string, string> = {
  w: "forward",
  ArrowUp: "forward",
  s: "backward",
  ArrowDown: "backward",
  a: "left",
  ArrowLeft: "left",
  d: "right",
  ArrowRight: "right",
};

export const walkKey = (key: string) =>
  keyDirections[key.length === 1 ? key.toLowerCase() : key];
