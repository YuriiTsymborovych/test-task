import * as PIXI from "pixi.js";
import { Floor } from "./Floor";
import { Elevator } from "./Elevator";

export class Building {
  public container: PIXI.Container;
  public floors: Floor[] = [];
  public elevator!: Elevator;

  private numFloors: number;
  private elevatorWidth: number;
  private floorHeight: number;
  private buildingWidth: number;
  private buildingHeight: number;

  constructor(
    numFloors: number,
    elevatorWidth: number,
    floorHeight: number,
    buildingWidth: number,
    buildingHeight: number,
  ) {
    this.container = new PIXI.Container();

    this.numFloors = numFloors;
    this.elevatorWidth = elevatorWidth;
    this.floorHeight = floorHeight;
    this.buildingWidth = buildingWidth;
    this.buildingHeight = buildingHeight;

    this.build();
  }

  private build() {
    this.container.removeChildren();
    this.floors = [];

    const buildingRect = new PIXI.Graphics()
      .rect(0, 0, this.buildingWidth, this.buildingHeight)
      .fill(0xffffff)
      .stroke({ width: 3, color: 0x000000 });
    this.container.addChild(buildingRect);

    this.elevator = new Elevator(
      5,
      (this.numFloors - 1) * this.floorHeight,
      this.elevatorWidth,
      this.floorHeight,
    );
    this.container.addChild(this.elevator.container);

    const floorWidth = this.buildingWidth - this.elevatorWidth - 10;
    for (let i = 0; i < this.numFloors; i++) {
      const y = (this.numFloors - i - 1) * this.floorHeight;
      const floor = new Floor(
        y,
        floorWidth,
        this.floorHeight,
        this.elevatorWidth + 10,
        i + 1,
      );
      this.floors.push(floor);
      this.container.addChild(floor.container);
    }
  }

  /**
   * Перебудувати будівлю з новими параметрами
   */
  public setConfig(
    numFloors: number,
    elevatorWidth: number,
    buildingHeight: number,
  ) {
    this.numFloors = numFloors;
    this.elevatorWidth = elevatorWidth;
    this.buildingHeight = buildingHeight;

    this.build();
  }
}
