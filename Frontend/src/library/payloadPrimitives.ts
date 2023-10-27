import { useContentStore } from "@/stores/content";

class Vector3 {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class Point {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    const contentStore = useContentStore();
    this.x = x;
    this.y = contentStore.chipLengthY - y;
    this.z = z;
  }
}

abstract class PayloadShape {
  fill: boolean;
  height?: number;
  constructor(fill: boolean, height?: number) {
    this.fill = fill;
    if (height) this.height = height;
  }
}

class PayloadPolygon extends PayloadShape {
  type = "Polygon";
  points: Point[];
  direction: Point;
  constructor(
    points: Point[],
    fill: boolean,
    dir_X: number,
    dir_Y: number,
    dir_Z: number
  ) {
    super(fill);
    this.points = points;
    this.direction = new Vector3(dir_X, -dir_Y, dir_Z);
  }
}

class PayloadCircle extends PayloadShape {
  type = "Circle";
  center: Point;
  radius: number;
  constructor(center: Point, fill: boolean, height: number, radius: number) {
    super(fill, height);
    this.center = center;
    this.radius = radius;
  }
}

class PayloadChamfer extends PayloadCircle {
  type = "Chamfer";
  radius_top: number;
  constructor(
    center: Point,
    fill: boolean,
    height: number,
    radius: number,
    radius_top: number
  ) {
    super(center, fill, height, radius);
    this.radius_top = radius_top;
  }
}

class PayloadLine {
  type = "Line";
  start: Point;
  end: Point;
  height: number;
  width: number;
  constructor(start: Point, end: Point, width: number, height: number) {
    this.start = start;
    this.end = end;
    this.width = width;
    this.height = height;
  }
}

// width : parallel to the plane
// height ：perpendicular to the plane
class PayloadCurve extends PayloadLine {
  type = "Curve";
  center: Point;
  tangent: Point;
  constructor(
    center: Point,
    start: Point,
    end: Point,
    corner: Point,
    width: number,
    height: number
  ) {
    super(start, end, width, height);
    this.center = center;
    this.tangent = new Vector3(
      (corner.x - start.x) / 1000,
      (corner.y - start.y) / 1000,
      (corner.z - start.z) / 1000
    );
  }
}

class PayloadChannel {
  shapes: (PayloadLine | PayloadCircle)[];
  constructor(shapes: (PayloadLine | PayloadCircle)[]) {
    this.shapes = shapes;
  }
}

export {
  Point,
  Vector3,
  PayloadCircle,
  PayloadPolygon,
  PayloadShape,
  PayloadLine,
  PayloadCurve,
  PayloadChamfer,
  PayloadChannel
};
