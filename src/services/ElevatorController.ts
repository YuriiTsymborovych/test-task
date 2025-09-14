import * as PIXI from "pixi.js";
import { Elevator } from "../models/Elevator";
import { Floor } from "../models/Floor";
import { Group, Tween } from "@tweenjs/tween.js";

export class ElevatorManager {
  private elevator: Elevator;
  private floors: Floor[];
  private tweenGroup: Group;
  private direction: "up" | "down" | null = null;
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

  private moveToFloor(floorNumber: number, onComplete?: () => void) {
    if (this.isMoving) return;
    this.isMoving = true;

    const floorsHeight = this.floors.length * this.floorHeight;
    const y =
      floorsHeight -
      this.floors[this.floors.length - floorNumber].container.y -
      this.floorHeight;

    const distance = Math.abs(this.currentFloor - floorNumber);
    const speed = distance * 1000;

    new Tween(this.elevator.container, this.tweenGroup)
      .to({ y }, speed)
      .onComplete(() => {
        this.currentFloor = floorNumber;
        this.isMoving = false;
        if (onComplete) onComplete();
      })
      .start();
  }

  public tryMove() {
    if (this.isMoving) return;

    if (this.elevator.passengers.length === 0) {
      const floor = this.floors[this.currentFloor - 1];
      if (floor.persons.length === 0) {
        const nextFloorInfo = this.getFirstWaitingPerson();
        if (!nextFloorInfo) return;
        this.currentFloor = nextFloorInfo.floorNumber;
        this.direction =
          nextFloorInfo.person.targetFloor > nextFloorInfo.floorNumber
            ? "up"
            : "down";
      } else {
        const firstPerson = floor.persons[0];
        this.direction =
          firstPerson.targetFloor > this.currentFloor ? "up" : "down";
      }
      this.handleFloor();
      return;
    }

    const nextFloor = this.getNextFloor();
    if (nextFloor !== null) {
      this.moveToFloor(nextFloor, () => this.handleFloor());
    }
  }

  private handleFloor() {
    const floor = this.floors[this.currentFloor - 1];

    this.elevator.passengers = this.elevator.passengers.filter((person) => {
      if (person.targetFloor === this.currentFloor) {
        person.leaveElevator(this.tweenGroup, () => {
          if (this.elevator.container.parent) {
            const globalPos = this.elevator.container.toGlobal(
              person.container.position,
            );
            floor.container.addChild(person.container);
            const localPos = floor.container.toLocal(globalPos);
            person.container.position.set(localPos.x, localPos.y);
            person.container.destroy();
          }
          this.updatePassengerPositions();
        });
        return false;
      }
      return true;
    });

    const waiting = floor.persons.filter(
      (person) => person.direction === this.direction,
    );

    for (const person of waiting) {
      if (this.elevator.passengers.length >= this.elevatorCapacity) break;
      floor.removePerson(person, this.tweenGroup);

      person.enterElevator(this.tweenGroup, () => {
        if (person.container.parent) {
          const globalPos = person.container.parent.toGlobal(
            person.container.position,
          );

          this.elevator.container.addChild(person.container);

          const localPos = this.elevator.container.toLocal(globalPos);
          person.container.position.set(localPos.x, localPos.y);
        }
      });

      this.elevator.passengers.push(person);
      this.updatePassengerPositions();

      const index = floor.persons.indexOf(person);
      if (index !== -1) floor.persons.splice(index, 1);
    }

    if (this.elevator.passengers.length === 0 && floor.persons.length > 0) {
      const firstPerson = floor.persons[0];
      this.direction =
        firstPerson.targetFloor > this.currentFloor ? "up" : "down";
    }

    if (this.currentFloor === this.floors.length && this.direction === "up") {
      this.direction = "down";
    } else if (this.currentFloor === 1 && this.direction === "down") {
      this.direction = "up";
    }
    this.delay(800, () => this.tryMove());
  }

  private getNextFloor(): number | null {
    if (!this.direction) return null;

    const dir = this.direction;

    const targetFloors = [
      ...this.elevator.passengers.map((person) => person.targetFloor),
      ...this.floors
        .map((floor, index) => index + 1)
        .filter((floorNumber) => {
          const floor = this.floors[floorNumber - 1];
          return (
            floor.persons.some((person) => person.direction === dir) &&
            floorNumber !== this.currentFloor
          );
        }),
    ];

    if (targetFloors.length === 0) return null;

    if (dir === "up") {
      const above = targetFloors.filter((floor) => floor > this.currentFloor);
      return above.length > 0 ? Math.min(...above) : null;
    } else {
      const below = targetFloors.filter((floor) => floor < this.currentFloor);
      return below.length > 0 ? Math.max(...below) : null;
    }
  }

  private getFirstWaitingPerson() {
    for (let i = 0; i < this.floors.length; i++) {
      const floor = this.floors[i];
      if (floor.persons.length > 0) {
        return { person: floor.persons[0], floorNumber: i + 1 };
      }
    }
    return null;
  }

  private delay(ms: number, callback: () => void) {
    let elapsed = 0;

    const tick = (ticker: PIXI.Ticker) => {
      elapsed += ticker.deltaMS;
      if (elapsed >= ms) {
        PIXI.Ticker.shared.remove(tick);
        callback();
      }
    };

    PIXI.Ticker.shared.add(tick);
  }

  private updatePassengerPositions() {
    this.elevator.passengers.forEach((person, i) => {
      const posX = i * 31;
      const posY = 45;

      person.moveTo(posX, posY, this.tweenGroup);
    });
  }

  public setCapacity(newCapacity: number) {
    this.elevatorCapacity = newCapacity;
    this.updatePassengerPositions();
  }
}
