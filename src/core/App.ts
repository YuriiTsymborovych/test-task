import * as PIXI from "pixi.js";

export class App {
  public app: PIXI.Application;

  constructor(width: number, height: number) {
    this.app = new PIXI.Application();
    this.init(width, height);
  }

  private async init(width: number, height: number) {
    await this.app.init({
      width,
      height,
      backgroundColor: 0xfafafa,
    });

    const pixiDiv = document.getElementById("pixi-container");
    if (pixiDiv) {
      pixiDiv.appendChild(this.app.canvas);
    } else {
      document.body.appendChild(this.app.canvas);
    }
  }

  get stage() {
    return this.app.stage;
  }
}
