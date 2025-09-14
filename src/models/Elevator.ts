import * as PIXI from "pixi.js";
import { Person } from "./Person";

export class Elevator {
  public container: PIXI.Container;
  public passengers: Person[] = [];

  constructor(x: number, y: number, width: number, height: number) {
    this.container = new PIXI.Container();
    const graph = new PIXI.Graphics();

    graph.rect(0, 0, width, height).fill(0xcccccc);
    graph
      .moveTo(0, 0)
      .lineTo(width, 0)
      .moveTo(0, 0)
      .lineTo(0, height)
      .moveTo(0, height)
      .lineTo(width, height);

    const doorGap = height * 0.3;
    const doorOffset = (height - doorGap) / 2;
    graph.moveTo(width, 0).lineTo(width, doorOffset);
    graph.stroke({ width: 2, color: 0x4682b4 });

    this.container.addChild(graph);
    this.container.x = x;
    this.container.y = y;
  }
}
