import { useContentStore } from "@/stores/content";
import { parseSVG, makeAbsolute, CommandMadeAbsolute } from "svg-path-parser";
import {
  PayloadCircle,
  Point,
  PayloadPolygon,
  PayloadShape,
  PayloadLine,
  PayloadCurve,
  PayloadChannel
} from "./payloadPrimitives";

export const pointTransform = (
  px: number,
  py: number,
  translate: number[],
  r: number,
  origin: number[]
): [number, number] => {
  if (r === 0 && translate[0] === 0 && translate[1] === 0) {
    return [px, py];
  }
  // rotate -> translate
  const radius = (r / 180) * Math.PI;
  const cosR = Math.cos(radius);
  const sinR = Math.sin(radius);
  const x0 = px - origin[0];
  const y0 = py - origin[1];
  const x1 = x0 * cosR - y0 * sinR;
  const y1 = x0 * sinR + y0 * cosR;
  return [x1 + origin[0] + translate[0], y1 + origin[1] + translate[1]];
};

export class Rectangle {
  x: number;
  y: number;
  r: number;
  width: number;
  height: number;
  isFilled: boolean;
  static vueComponent = "PrimitiveRectangle";
  get vueComponent(): string {
    return Rectangle.vueComponent;
  }
  constructor(
    x: number,
    y: number,
    r: number,
    width: number,
    height: number,
    fill: boolean
  ) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.width = width;
    this.height = height;
    this.isFilled = fill;
  }
  buildPayload(
    z: number,
    height: number,
    translate: number[],
    rotation: number,
    origin: number[]
  ): PayloadShape[] | void {
    if (this.width === 0 || this.height === 0) return;
    const res = Array<PayloadShape>();

    const x2 = this.x + this.r;
    const x3 = this.x + this.width - this.r;
    const x4 = this.x + this.width;

    const y2 = this.y + this.r;
    const y3 = this.y + this.height - this.r;
    const y4 = this.y + this.height;

    if (this.r > 0) {
      const octPoints = Array<[number, number]>();
      const circleCenter = Array<[number, number]>();
      const distX = x2 - x3 !== 0;
      const distY = y2 - y3 !== 0;
      octPoints.push([x2, this.y]);
      if (distX) octPoints.push([x3, this.y]);
      octPoints.push([x4, y2]);
      if (distY) octPoints.push([x4, y3]);
      octPoints.push([x3, y4]);
      if (distX) octPoints.push([x2, y4]);
      octPoints.push([this.x, y3]);
      if (distY) octPoints.push([this.x, y2]);

      circleCenter.push([x2, y2]);
      if (distX) circleCenter.push([x3, y2]);
      if (distY) circleCenter.push([x3, y3]);
      if (distX && distY) circleCenter.push([x2, y3]);

      res.push(
        new PayloadPolygon(
          octPoints.map((p0) => {
            const p = pointTransform(p0[0], p0[1], translate, rotation, origin);
            return new Point(p[0], p[1], z);
          }),
          this.isFilled,
          0,
          0,
          height
        )
      );
      circleCenter.forEach((p0) => {
        const p = pointTransform(p0[0], p0[1], translate, rotation, origin);
        res.push(
          new PayloadCircle(
            new Point(p[0], p[1], z),
            this.isFilled,
            height,
            this.r
          )
        );
      });
    } else {
      const cornerPoints = Array<[number, number]>();
      cornerPoints.push([this.x, this.y]);
      cornerPoints.push([x4, this.y]);
      cornerPoints.push([x4, y4]);
      cornerPoints.push([this.x, y4]);
      const ps = cornerPoints.map((p0) => {
        const p = pointTransform(p0[0], p0[1], translate, rotation, origin);
        return new Point(p[0], p[1], z);
      });
      res.push(new PayloadPolygon(ps, this.isFilled, 0, 0, height));
    }
    return res;
  }
}

export class Circle {
  cx: number;
  cy: number;
  r: number;
  isFilled: boolean;
  static vueComponent = "PrimitiveCircle";

  get vueComponent(): string {
    return Circle.vueComponent;
  }
  constructor(cx: number, cy: number, r: number, fill: boolean) {
    this.cx = cx;
    this.cy = cy;
    this.r = r;
    this.isFilled = fill;
  }

  buildPayload(
    z: number,
    height: number,
    translate: number[],
    rotation: number,
    origin: number[]
  ): [PayloadCircle] | void {
    if (this.r === 0) return;
    const p = pointTransform(this.cx, this.cy, translate, rotation, origin);
    return [
      new PayloadCircle(new Point(p[0], p[1], z), this.isFilled, height, this.r)
    ];
  }
}

// (rounded) polygons, solid only
export class Polygon {
  points: number[][];
  isFilled: boolean;
  r: number;
  static vueComponent = "PrimitivePolygon";
  get vueComponent(): string {
    return Polygon.vueComponent;
  }
  constructor(points: number[][], fill: boolean, r?: number) {
    this.points = points;
    this.isFilled = fill;
    this.r = r ? r : 0;
  }
  buildPayload(
    z: number,
    height: number,
    translate: number[],
    r: number,
    origin: number[]
  ): PayloadShape[] | void {
    try {
      if (this.r > 0) {
        const shapes = Array<PayloadShape>();
        const contentStore = useContentStore();
        const polyPath = contentStore.polygonPathDefinition(this.points, r);
        const pathSegments = makeAbsolute(parseSVG(polyPath));
        const circleCenter = Array<Point>();
        const vertices = Array<Point>();
        for (let i = 1; i < pathSegments.length; ++i) {
          addPolygonPoints(
            pathSegments[i],
            z,
            translate,
            r,
            origin,
            circleCenter,
            vertices
          );
        }
        shapes.push(new PayloadPolygon(vertices, this.isFilled, 0, 0, height));
        circleCenter.forEach((c) => {
          shapes.push(new PayloadCircle(c, this.isFilled, height, this.r));
        });
        return shapes;
      } else {
        const plPoints = this.points.map((p0) => {
          const p = pointTransform(p0[0], p0[1], translate, r, origin);
          return new Point(p[0], p[1], z);
        });
        return [new PayloadPolygon(plPoints, this.isFilled, 0, 0, height)];
      }
    } catch (err) {
      console.log(err);
    }
  }
}

// closed or open
export class Path {
  d: string;
  strokeWidth: number;
  isFilled: boolean;
  static vueComponent = "PrimitiveChannel";
  get vueComponent(): string {
    return Path.vueComponent;
  }
  constructor(d: string, sW: number, fill: boolean) {
    this.d = d;
    this.strokeWidth = sW;
    this.isFilled = fill;
  }
  buildPayload(
    z: number,
    height: number,
    translate: number[],
    rotation: number,
    origin: number[]
  ): PayloadChannel {
    return buildPayloadPathPrimitive(
      this.d,
      z + height / 2,
      height,
      this.strokeWidth,
      translate,
      rotation,
      origin
    );
  }
}

export const buildPayloadPolygonPrimitive = (
  points: number[][],
  isFilled: boolean,
  radius: number,
  z: number,
  height: number,
  translate: number[],
  rotation: number,
  origin: number[]
): PayloadShape[] | void => {
  try {
    if (radius > 0) {
      const shapes = Array<PayloadShape>();
      const contentStore = useContentStore();
      const polyPath = contentStore.polygonPathDefinition(points, radius);
      const pathSegments = makeAbsolute(parseSVG(polyPath));
      const circleCenter = Array<Point>();
      const vertices = Array<Point>();
      for (let i = 1; i < pathSegments.length; ++i) {
        addPolygonPoints(
          pathSegments[i],
          z,
          translate,
          rotation,
          origin,
          circleCenter,
          vertices
        );
      }
      shapes.push(new PayloadPolygon(vertices, isFilled, 0, 0, height));
      circleCenter.forEach((c) => {
        shapes.push(new PayloadCircle(c, isFilled, height, radius));
      });
      return shapes;
    } else {
      const plPoints = points.map((p0) => {
        const p = pointTransform(p0[0], p0[1], translate, rotation, origin);
        return new Point(p[0], p[1], z);
      });
      return [new PayloadPolygon(plPoints, isFilled, 0, 0, height)];
    }
  } catch (err) {
    console.log(err);
  }
};

export const buildPayloadPathPrimitive = (
  d: string,
  z: number,
  height: number,
  width: number,
  translate: number[],
  rotation: number,
  origin: number[]
): PayloadChannel => {
  const shapes = Array<PayloadLine | PayloadCircle>();
  const pathSegments = makeAbsolute(parseSVG(d));
  for (let i = 1; i < pathSegments.length; ++i) {
    parsePathSegment(
      pathSegments[i],
      z,
      translate,
      rotation,
      origin,
      height,
      width,
      pathSegments[i - 1].command,
      shapes
    );
  }
  return new PayloadChannel(shapes);
};

const addTransitionCircle = (
  z: number,
  cx: number,
  cy: number,
  channelHeight: number,
  channelWidth: number,
  lastCommand: string,
  shapes: (PayloadLine | PayloadCircle)[]
) => {
  if (
    lastCommand === "lineto" ||
    lastCommand === "vertical lineto" ||
    lastCommand === "horizontal lineto" ||
    lastCommand === "elliptical arc"
  ) {
    shapes.push(
      new PayloadCircle(
        new Point(cx, cy, z - channelHeight / 2),
        false,
        channelHeight,
        channelWidth / 2
      )
    );
  }
};

// for polygons / rounded polygons, solid only
const addPolygonPoints = (
  seg: CommandMadeAbsolute,
  z: number,
  translate: number[],
  rotation: number,
  origin: number[],
  roundedCornerCenter: Point[],
  vertices: Point[]
) => {
  const st = pointTransform(seg.x0, seg.y0, translate, rotation, origin);
  const ed = pointTransform(seg.x, seg.y, translate, rotation, origin);
  switch (seg.command) {
    case "lineto":
    case "vertical lineto":
    case "horizontal lineto":
    case "closepath": {
      if (seg.x0 === seg.x && seg.y0 === seg.y) return;
      vertices.push(new Point(ed[0], ed[1], z));
      break;
    }
    case "elliptical arc": {
      if (seg.rx === seg.ry && seg.rx !== 0) {
        if (seg.x0 === seg.x && seg.y0 === seg.y) return;
        const additional = calculateCenterTangent(
          st[0],
          st[1],
          ed[0],
          ed[1],
          seg.rx,
          seg.sweep,
          seg.largeArc
        );
        roundedCornerCenter.push(new Point(additional.cx, additional.cy, z));
        vertices.push(new Point(ed[0], ed[1], z));
      } else {
        console.log("invalid arc: rx !== ry or rx === 0");
      }
      break;
    }
  }
};

const addLine = (
  z: number,
  st: number[],
  ed: number[],
  channelHeight: number,
  channelWidth: number,
  lastCommand: string,
  shapes: (PayloadLine | PayloadCircle)[]
) => {
  addTransitionCircle(
    z,
    st[0],
    st[1],
    channelHeight,
    channelWidth,
    lastCommand,
    shapes
  );
  shapes.push(
    new PayloadLine(
      new Point(st[0], st[1], z),
      new Point(ed[0], ed[1], z),
      channelWidth,
      channelHeight
    )
  );
};
const parsePathSegment = (
  seg: CommandMadeAbsolute,
  z: number,
  translate: number[],
  rotation: number,
  origin: number[],
  channelHeight: number,
  channelWidth: number,
  lastCommand: string,
  shapes: (PayloadLine | PayloadCircle)[]
) => {
  const st = pointTransform(seg.x0, seg.y0, translate, rotation, origin);
  const ed = pointTransform(seg.x, seg.y, translate, rotation, origin);
  switch (seg.command) {
    case "closepath": {
      if (seg.x0 === seg.x && seg.y0 === seg.y) return;
      addLine(z, st, ed, channelHeight, channelWidth, lastCommand, shapes);
      addTransitionCircle(
        z,
        ed[0],
        ed[1],
        channelHeight,
        channelWidth,
        lastCommand,
        shapes
      );
      break;
    }
    case "lineto":
    case "vertical lineto":
    case "horizontal lineto": {
      if (seg.x0 === seg.x && seg.y0 === seg.y) return;
      addLine(z, st, ed, channelHeight, channelWidth, lastCommand, shapes);
      break;
    }
    case "elliptical arc": {
      if (seg.rx === seg.ry && seg.rx !== 0) {
        if (seg.x0 === seg.x && seg.y0 === seg.y) return;
        addTransitionCircle(
          z,
          st[0],
          st[1],
          channelHeight,
          channelWidth,
          lastCommand,
          shapes
        );
        const additional = calculateCenterTangent(
          st[0],
          st[1],
          ed[0],
          ed[1],
          seg.rx,
          seg.sweep,
          seg.largeArc
        );
        // console.log(additional);
        shapes.push(
          new PayloadCurve(
            new Point(additional.cx, additional.cy, z),
            new Point(st[0], st[1], z),
            new Point(ed[0], ed[1], z),
            new Point(additional.tx, additional.ty, z),
            channelWidth,
            channelHeight
          )
        );
      } else {
        console.log("invalid arc: rx !== ry or rx === 0");
      }
      break;
    }
  }
};

const calculateCenterTangent = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  radius: number,
  sweep: boolean,
  largeArc: boolean
) => {
  const tmp0X = x1 - x0;
  const tmp0Y = y1 - y0;
  const h2 = Math.sqrt(tmp0X ** 2 + tmp0Y ** 2);
  const cosA = Math.min(1, h2 / 2 / radius);
  const sinA = Math.sqrt(1 - cosA ** 2);
  const k = radius / h2;

  const tmpX = tmp0X * k;
  const tmpY = tmp0Y * k;

  if (sweep !== largeArc) {
    // c1
    const cx = tmpX * cosA - tmpY * sinA + x0;
    const cy = tmpX * sinA + tmpY * cosA + y0;
    if (sweep) {
      const tx = tmp0X * sinA + tmp0Y * cosA + x0;
      const ty = -tmp0X * cosA + tmp0Y * sinA + y0;
      return { cx, cy, tx, ty };
    } else {
      const tx = -tmp0X * sinA - tmp0Y * cosA + x0;
      const ty = tmp0X * cosA - tmp0Y * sinA + y0;
      return { cx, cy, tx, ty };
    }
  } else {
    // c2
    const cx = tmpX * cosA + tmpY * sinA + x0;
    const cy = tmpY * cosA - tmpX * sinA + y0;
    if (sweep) {
      const tx = -tmp0X * sinA + tmp0Y * cosA + x0;
      const ty = -tmp0X * cosA - tmp0Y * sinA + y0;
      return { cx, cy, tx, ty };
    } else {
      const tx = tmp0X * sinA - tmp0Y * cosA + x0;
      const ty = tmp0X * cosA + tmp0Y * sinA + y0;
      return { cx, cy, tx, ty };
    }
  }
};
