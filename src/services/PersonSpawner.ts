import { Person } from "../models/Person";
import { Floor } from "../models/Floor";
import * as PIXI from "pixi.js";
import { Group } from "@tweenjs/tween.js";
import { ElevatorManager } from "./ElevatorController";

interface SpawnTimer {
  time: number;
  next: number;
}

export class PersonManager {
  private floors: Floor[];
  private app: PIXI.Application;
  private numFloors: number;
  private timers: SpawnTimer[];
  private tweenGroup: Group;
  private elevatorManager: ElevatorManager;

  constructor(
    floors: Floor[],
    app: PIXI.Application,
    numFloors: number,
    tweenGroup: Group,
    elevatorManager: ElevatorManager,
  ) {
    this.floors = floors;
    this.app = app;
    this.numFloors = numFloors;
    this.timers = Array.from({ length: numFloors }, () => ({
      time: 0,
      next: 4000 + Math.random() * 6000,
    }));

    PIXI.Ticker.shared.add(this.update, this);
    this.tweenGroup = tweenGroup;
    this.elevatorManager = elevatorManager;
  }

  private update(ticker: PIXI.Ticker) {
    const dt = ticker.deltaMS;
    for (let i = 0; i < this.numFloors; i++) {
      this.timers[i].time += dt;
      if (this.timers[i].time >= this.timers[i].next) {
        this.spawnPerson(i);
        this.timers[i].time = 0;
        this.timers[i].next = 4000 + Math.random() * 6000;
      }
    }
  }

  private spawnPerson(floorIndex: number) {
    const currentFloor = floorIndex + 1;
    let targetFloor = currentFloor;
    while (targetFloor === currentFloor) {
      targetFloor = Math.floor(Math.random() * this.numFloors) + 1;
    }

    const floor = this.floors[floorIndex];
    const startX = floor.container.width - 105;
    const startY = 45;

    const queueIndex = floor.persons.length;
    const queueX = 10 + queueIndex * 35;
    const queueY = 45;

    const person = new Person(currentFloor, targetFloor);
    person.setPosition(startX, startY);
    this.floors[floorIndex].addPerson(person);

    person.moveTo(queueX, queueY, this.tweenGroup, () => {});
  }
}
