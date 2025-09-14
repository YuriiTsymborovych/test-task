import * as PIXI from "pixi.js";
import { App } from "./core/App";
import { Building } from "./models/Building";
import { PersonManager } from "./services/PersonSpawner";
import { Group } from "@tweenjs/tween.js";
import { ElevatorManager } from "./services/ElevatorController";

const WIDTH = 1000;
const BUILDING_WIDTH = 800;
const NUM_FLOORS = 10;
const MAX_NUM_PERSONS_IN_ELEVATOR = 4;
const FLOOR_HEIGHT = 90;
const ELEVATOR_WIDTH = MAX_NUM_PERSONS_IN_ELEVATOR * 40;
const BUILDING_HEIGHT = FLOOR_HEIGHT * NUM_FLOORS;
const STAGE_HEIGHT = BUILDING_HEIGHT + 100;

const app = new App(WIDTH, STAGE_HEIGHT);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__PIXI_APP__ = app;

const building = new Building(
  NUM_FLOORS,
  ELEVATOR_WIDTH,
  FLOOR_HEIGHT,
  BUILDING_WIDTH,
  BUILDING_HEIGHT,
);
building.container.x = (WIDTH - BUILDING_WIDTH) / 2;
building.container.y = (STAGE_HEIGHT - BUILDING_HEIGHT) / 2;

app.stage.addChild(building.container);

const tweenGroup = new Group();

const elevatorManager = new ElevatorManager(
  building.elevator,
  building.floors,
  tweenGroup,
  MAX_NUM_PERSONS_IN_ELEVATOR,
  FLOOR_HEIGHT,
);

new PersonManager(
  building.floors,
  app.app,
  NUM_FLOORS,
  tweenGroup,
  elevatorManager,
);

PIXI.Ticker.shared.add(() => {
  tweenGroup.update();
});
