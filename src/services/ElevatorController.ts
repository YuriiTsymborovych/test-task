import * as PIXI from "pixi.js";
import { Elevator } from "../models/Elevator";
import { Floor } from "../models/Floor";
import { Group, Tween, Easing } from "@tweenjs/tween.js";

export class ElevatorManager {
  private elevator: Elevator;
  private floors: Floor[];
  private tweenGroup: Group;
  private direction: "up" | "down" = "up";
  private currentFloor: number = 1;
  private isMoving: boolean = false;

  constructor(
    elevator: Elevator,
    floors: Floor[],
    tweenGroup: Group,
    private elevatorCapacity: number,
    private floorHeight: number,
  ) {
    this.elevator = elevator;
    this.floors = floors;
    this.tweenGroup = tweenGroup;
  }

  public start() {
    if (!this.isMoving) this.tryMove();
  }

  private moveToFloor(floorNumber: number, onComplete?: () => void) {
    this.isMoving = true;

    const floorsHeight = this.floors.length * this.floorHeight;
    const y =
      floorsHeight -
      this.floors[this.floors.length - floorNumber].container.y -
      this.floorHeight;

    const distance = Math.abs(this.currentFloor - floorNumber);
    const duration = Math.max(1, distance) * 1000;

    new Tween(this.elevator.container, this.tweenGroup)
      .to({ y }, duration)
      .easing(Easing.Linear.None)
      .onComplete(() => {
        this.currentFloor = floorNumber;
        this.isMoving = false;
        if (onComplete) onComplete();
      })
      .start();
  }

  private tryMove() {
    if (this.isMoving) return;

    let nextFloor: number;

    if (this.direction === "up") {
      nextFloor = this.currentFloor + 1;
      while (
        nextFloor <= this.floors.length &&
        this.floors[nextFloor - 1].persons.length === 0 &&
        !this.elevator.passengers.some((p) => p.targetFloor === nextFloor)
      ) {
        nextFloor++;
      }
      if (nextFloor > this.floors.length) {
        this.direction = "down";
        nextFloor = this.currentFloor - 1;
      }
    } else {
      nextFloor = this.currentFloor - 1;
      while (
        nextFloor >= 1 &&
        this.floors[nextFloor - 1].persons.length === 0 &&
        !this.elevator.passengers.some((p) => p.targetFloor === nextFloor)
      ) {
        nextFloor--;
      }
      if (nextFloor < 1) {
        this.direction = "up";
        nextFloor = this.currentFloor + 1;
      }
    }

    if (nextFloor < 1) nextFloor = 1;
    if (nextFloor > this.floors.length) nextFloor = this.floors.length;
    this.moveToFloor(nextFloor, () => this.handleFloor());
  }

  private handleFloor() {
    const floor = this.floors[this.currentFloor - 1];

    const exiting = this.elevator.passengers.filter(
      (person) => person.targetFloor === this.currentFloor,
    );

    if (exiting.length > 0) {
      this.elevator.passengers = this.elevator.passengers.filter(
        (person) => person.targetFloor !== this.currentFloor,
      );
    }

    exiting.forEach((person) => {
      person.leaveElevator(this.tweenGroup, () => {
        const globalPos = person.container.getGlobalPosition();
        floor.container.addChild(person.container);
        const localPos = floor.container.toLocal(globalPos);
        person.container.position.set(localPos.x, localPos.y);

        person.container.destroy();
      });
    });
    this.updatePassengerPositions();

    const waiting = floor.persons;
    if (this.elevator.passengers.length === 0 && waiting.length > 0) {
      const first = waiting[0];
      this.direction = first.targetFloor > this.currentFloor ? "up" : "down";
    }

    const waitingInDirection = waiting.filter(
      (person) =>
        (person.targetFloor > this.currentFloor ? "up" : "down") ===
        this.direction,
    );

    const freeSlots = this.elevatorCapacity - this.elevator.passengers.length;
    const toEnter = Math.min(waitingInDirection.length, Math.max(0, freeSlots));

    if (toEnter > 0) {
      const entering = waitingInDirection.slice(0, toEnter);

      entering.forEach((p) => {
        floor.removePerson(p, this.tweenGroup);
      });

      entering.forEach((person) => {
        person.enterElevator(this.tweenGroup, () => {
          const globalPos = person.container.getGlobalPosition();
          this.elevator.container.addChild(person.container);
          const localPos = this.elevator.container.toLocal(globalPos);
          person.container.position.set(localPos.x, localPos.y);

          this.elevator.passengers.push(person);
          this.updatePassengerPositions();
        });
      });
    }

    this.delay(800, () => {
      if (this.elevator.passengers.length === 0) {
        if (this.currentFloor === this.floors.length) {
          this.direction = "down";
        } else if (this.currentFloor === 1) {
          this.direction = "up";
        }
      }

      this.tryMove();
    });
  }

  private delay(ms: number, callback?: () => void) {
    let elapsed = 0;
    const tick = (ticker: PIXI.Ticker) => {
      elapsed += ticker.deltaMS;
      if (elapsed >= ms) {
        PIXI.Ticker.shared.remove(tick);
        if (callback) callback();
      }
    };
    PIXI.Ticker.shared.add(tick);
  }

  private updatePassengerPositions() {
    this.elevator.passengers.forEach((person, i) => {
      const posX = i * 33;
      const posY = 45;
      person.moveTo(posX, posY, this.tweenGroup);
    });
  }
}
