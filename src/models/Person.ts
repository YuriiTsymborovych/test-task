import * as PIXI from "pixi.js";
import { Tween, Easing, Group } from "@tweenjs/tween.js";
export type Direction = "up" | "down";

export class Person {
  public currentFloor: number;
  public targetFloor: number;
  public direction: Direction;
  public isInElevator: boolean = false;
  public container: PIXI.Container;
  private sprite: PIXI.Graphics;
  private text: PIXI.Text;

  constructor(currentFloor: number, targetFloor: number) {
    this.currentFloor = currentFloor;
    this.targetFloor = targetFloor;
    this.direction = targetFloor > currentFloor ? "up" : "down";
    const strokeColor = this.direction === "up" ? 0x0000ff : 0x008000;
    this.container = new PIXI.Container();

    this.sprite = new PIXI.Graphics()
      .rect(0, 0, 30, 40)
      .fill(0xffffff)
      .stroke({ width: 2, color: strokeColor });

    this.text = new PIXI.Text({
      text: targetFloor.toString(),
      style: {
        fontFamily: "Arial",
        fontSize: 12,
        fill: 0x000000,
      },
    });
    this.text.anchor.set(0.5);
    this.text.x = this.sprite.width / 2;
    this.text.y = this.sprite.height / 2;

    this.container.addChild(this.sprite);
    this.container.addChild(this.text);
  }

  setPosition(x: number, y: number) {
    this.container.x = x;
    this.container.y = y;
  }

  public moveTo(x: number, y: number, group: Group, onComplete?: () => void) {
    new Tween(this.container, group)
      .to({ x, y }, 800)
      .easing(Easing.Quadratic.Out)
      .onComplete(() => {
        if (onComplete) onComplete();
      })
      .start();
  }

  public leaveElevator(group: Group, onComplete?: () => void) {
    new Tween(this.container, group)
      .to({ x: 750 }, 800)
      .easing(Easing.Quadratic.Out)
      .onComplete(() => {
        if (onComplete) onComplete();
      })
      .start();
  }

  public enterElevator(group: Group, onComplete?: () => void) {
    new Tween(this.container, group)
      .to({ x: 0 }, 800)
      .easing(Easing.Quadratic.Out)
      .onComplete(() => {
        if (onComplete) onComplete();
      })
      .start();
  }
}
