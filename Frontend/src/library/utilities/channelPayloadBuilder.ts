import { Bridge } from "../bridge";
import { Channel } from "../channel";
import {
  PayloadChannel,
  PayloadCircle,
  PayloadCurve,
  PayloadLine,
  Point,
  Vector3
} from "../payloadPrimitives";

const getDirection = (p1: Point, p2: Point) => {
  return [p2.x - p1.x, p2.y - p1.y, p2.z - p1.z];
};
const shiftPointWithDirection = (p: Point, p1: Point, p2: Point) => {
  const dist = 10;
  const direction = getDirection(p1, p2);
  const k = Math.sqrt(
    direction[0] ** 2 + direction[1] ** 2 + direction[2] ** 2
  );
  const ratio = dist / k;
  const x = direction[0] * ratio + p.x;
  const y = direction[1] * ratio + p.y;
  const z = direction[2] * ratio + p.z;
  return new Vector3(x, y, z);
};

const calculateCoordsWithDirection = (
  px: number,
  py: number,
  direction: number[],
  distance: number
) => {
  // rotate vector [distance, 0] into direction
  // translate to p
  const k = Math.sqrt(direction[0] ** 2 + direction[1] ** 2);
  const cosR = direction[0] / k;
  const sinR = direction[1] / k;
  const x = distance * cosR + px;
  const y = distance * sinR + py;
  return { x, y };
};

const getBorderPoints = (
  bridge: Bridge,
  z: number,
  bridge_dx: number,
  bridge_dy: number,
  lengthLeft: number,
  lengthRight: number
) => {
  const channelSegLen = Math.sqrt(bridge_dx ** 2 + bridge_dy ** 2);

  // the highest point of the bridge
  const a_x =
    bridge.channelSegment.start.position[0] + bridge_dx * bridge.posOnSeg;
  const a_y =
    bridge.channelSegment.start.position[1] + bridge_dy * bridge.posOnSeg;
  const a_z = z + bridge.properties.height.value;

  // left
  const kb = bridge.posOnSeg - lengthLeft / channelSegLen;
  const b_x = bridge.channelSegment.start.position[0] + bridge_dx * kb;
  const b_y = bridge.channelSegment.start.position[1] + bridge_dy * kb;
  //right
  const kc = bridge.posOnSeg + lengthRight / channelSegLen;
  const c_x = bridge.channelSegment.start.position[0] + bridge_dx * kc;
  const c_y = bridge.channelSegment.start.position[1] + bridge_dy * kc;
  return {
    left: new Vector3(b_x, b_y, z),
    right: new Vector3(c_x, c_y, z),
    top: new Vector3(a_x, a_y, a_z)
  };
};

const buildBridgePayload = (
  bridge: Bridge,
  z: number,
  channelWidth: number,
  channelHeight: number
) => {
  const slopL = bridge.properties.slopeL.value;
  const slopR = bridge.properties.slopeR.value;
  const height = bridge.properties.height.value;
  const radius = Math.max(
    channelHeight + 1,
    bridge.properties.roundedRadius.value
  );
  const positiveDir = [
    bridge.channelSegment.end.position[0] -
      bridge.channelSegment.start.position[0],
    bridge.channelSegment.end.position[1] -
      bridge.channelSegment.start.position[1]
  ];
  const negativeDir = positiveDir.map((x) => -x);
  const lengthLeft =
    bridge.properties.height.value / Math.tan((slopL / 180) * Math.PI);
  const lengthRight =
    bridge.properties.height.value / Math.tan((slopR / 180) * Math.PI);

  const { left, right, top } = getBorderPoints(
    bridge,
    z,
    positiveDir[0],
    positiveDir[1],
    lengthLeft,
    lengthRight
  );
  const shapes = Array<PayloadLine>();
  // curve at start
  const dist1 = radius / Math.tan(((180 - slopL) / 360) * Math.PI);
  const p1 = calculateCoordsWithDirection(left.x, left.y, negativeDir, dist1);
  const dist2 = dist1 * Math.cos((slopL / 180) * Math.PI);
  const p2 = calculateCoordsWithDirection(left.x, left.y, positiveDir, dist2);
  const center1 = new Point(p1.x, p1.y, z + radius);
  const start1 = new Point(p1.x, p1.y, z);
  const end1 = new Point(
    p2.x,
    p2.y,
    z + dist1 * Math.sin((slopL / 180) * Math.PI)
  );
  const end1_proj = new Point(p2.x, p2.y, z);
  shapes.push(
    new PayloadCurve(
      center1,
      start1,
      end1,
      end1_proj,
      channelHeight,
      channelWidth
    )
  );

  // curve at top
  const tmp = radius / Math.tan(((180 - slopL - slopR) / 360) * Math.PI);
  const dist5 = tmp * Math.cos((slopL / 180) * Math.PI);
  const p5 = calculateCoordsWithDirection(top.x, top.y, negativeDir, dist5);
  const dist6 = tmp * Math.cos((slopR / 180) * Math.PI);
  const p6 = calculateCoordsWithDirection(top.x, top.y, positiveDir, dist6);
  const p5_z = z + height - tmp * Math.sin((slopL / 180) * Math.PI);
  const start3 = new Point(p5.x, p5.y, p5_z);
  const end3 = new Point(
    p6.x,
    p6.y,
    z + height - tmp * Math.sin((slopR / 180) * Math.PI)
  );
  // center top
  const p7 = calculateCoordsWithDirection(
    p5.x,
    p5.y,
    positiveDir,
    radius * Math.sin((slopL / 180) * Math.PI)
  );
  const center3 = new Point(
    p7.x,
    p7.y,
    p5_z - radius * Math.cos((slopL / 180) * Math.PI)
  );
  const end1shifted = shiftPointWithDirection(end1, start3, end1);
  const start3shifted = shiftPointWithDirection(start3, end1, start3);
  shapes.push(
    new PayloadLine(end1shifted, start3shifted, channelWidth, channelHeight)
  );
  shapes.push(
    new PayloadCurve(
      center3,
      start3,
      end3,
      new Point(top.x, top.y, z + height),
      channelHeight,
      channelWidth
    )
  );
  // const dist1 = radius / Math.tan(((180 - slopL) / 360) * Math.PI);
  // const p1 = calculateCoordsWithDirection(left.x, left.y, negativeDir, dist1);
  // const dist2 = dist1 * Math.cos((slopL / 180) * Math.PI);
  // const p2 = calculateCoordsWithDirection(left.x, left.y, positiveDir, dist2);
  // const center1 = new Point(p1.x, p1.y, z + radius);
  // const start1 = new Point(p1.x, p1.y, z);
  // const end1 = new Point(
  //   p2.x,
  //   p2.y,
  //   z + dist1 * Math.sin((slopL / 180) * Math.PI)
  // );
  // const end1_proj = new Point(p2.x, p2.y, z);
  //curve at end
  const dist3 = radius / Math.tan(((180 - slopR) / 360) * Math.PI);
  const p3 = calculateCoordsWithDirection(right.x, right.y, positiveDir, dist3);
  const dist4 = dist3 * Math.cos((slopR / 180) * Math.PI);
  const p4 = calculateCoordsWithDirection(right.x, right.y, negativeDir, dist4);
  const center2 = new Point(p3.x, p3.y, z + radius);
  const start2 = new Point(p3.x, p3.y, z);
  const end2 = new Point(
    p4.x,
    p4.y,
    z + dist3 * Math.sin((slopR / 180) * Math.PI)
  );
  const end2_proj = new Point(p4.x, p4.y, z);
  const end3Shifted = shiftPointWithDirection(end3, end2, end3);
  const end2Shifted = shiftPointWithDirection(end2, end3, end2);
  shapes.push(
    new PayloadLine(end3Shifted, end2Shifted, channelWidth, channelHeight)
  );
  shapes.push(
    new PayloadCurve(
      center2,
      start2,
      end2,
      end2_proj,
      channelHeight,
      channelWidth
    )
  );

  return { shapes, startPoint: start1, endPoint: start2 };
};

const addTransitionCircle = (
  shapes: (PayloadLine | PayloadCircle)[],
  cx: number,
  cy: number,
  channel: Channel,
  z: number,
  i: number,
  channelHeight: number
) => {
  if (i < channel.channelDef.length - 1) {
    const center = new Point(cx, cy, z - channelHeight / 2);
    shapes.push(
      new PayloadCircle(
        center,
        false,
        channelHeight,
        channel.properties.channelWidth.value / 2
      )
    );
  }
};

const addPortTransition = (
  shapes: (PayloadLine | PayloadCircle)[],
  channel: Channel,
  z: number,
  channelHeight: number
) => {
  if (channel.channelDef[0].isConnectedToPort) {
    const center = new Point(
      channel.channelDef[0].position[0],
      channel.channelDef[0].position[1],
      z - channelHeight / 2
    );
    shapes.push(
      new PayloadCircle(
        center,
        false,
        channelHeight,
        channel.properties.channelWidth.value / 2
      )
    );
  }
  if (channel.channelDef[channel.channelDef.length - 1].isConnectedToPort) {
    const center = new Point(
      channel.channelDef[channel.channelDef.length - 1].position[0],
      channel.channelDef[channel.channelDef.length - 1].position[1],
      z - channelHeight / 2
    );
    shapes.push(
      new PayloadCircle(
        center,
        false,
        channelHeight,
        channel.properties.channelWidth.value / 2
      )
    );
  }
};

const buildChannelPayload = (
  channel: Channel,
  z: number,
  channelHeight: number
): PayloadChannel => {
  let shapes = Array<PayloadLine | PayloadCircle>();
  const channelWidth = channel.properties.channelWidth.value;
  addPortTransition(shapes, channel, z, channelHeight);
  let lastPoint = new Point(
    channel.channelDef[0].position[0],
    channel.channelDef[0].position[1],
    z
  );
  if (channel.channelDef[0].isConnectedToPort) {
    addTransitionCircle(
      shapes,
      channel.channelDef[0].position[0],
      channel.channelDef[0].position[1],
      channel,
      z,
      0,
      channelHeight
    );
  }
  for (let i = 1; i < channel.channelDef.length; ++i) {
    if (channel.channelDef[i - 1].bridges.length > 0) {
      // sort if >= 2 bridges
      channel.channelDef[i - 1].bridges.sort(
        (b1, b2) => b1.posOnSeg - b2.posOnSeg
      );

      channel.channelDef[i - 1].bridges.forEach((bridge) => {
        const bridgePayload = buildBridgePayload(
          bridge,
          z,
          channelWidth,
          channelHeight
        );
        shapes.push(
          new PayloadLine(
            lastPoint,
            bridgePayload.startPoint,
            channelWidth,
            channelHeight
          )
        );
        shapes = shapes.concat(bridgePayload.shapes);
        lastPoint = bridgePayload.endPoint;
      });
    }
    const tmp_v = new Point(
      channel.channelDef[i].position[0],
      channel.channelDef[i].position[1],
      z
    );
    if (
      i < channel.channelDef.length - 1 &&
      channel.channelDef[i].roundedRadius > 0
    ) {
      const r = channel.channelDef[i].roundedRadius;
      const B = channel.channelDef[i - 1].position;
      const A = channel.channelDef[i].position;
      const C = channel.channelDef[i + 1].position;
      const AB = [B[0] - A[0], B[1] - A[1]];
      const AC = [C[0] - A[0], C[1] - A[1]];
      const dAB = Math.sqrt(AB[0] ** 2 + AB[1] ** 2);
      const dAC = Math.sqrt(AC[0] ** 2 + AC[1] ** 2);
      const cosA = (AB[0] * AC[0] + AB[1] * AC[1]) / (dAB * dAC);
      const tanAHalf = Math.sqrt((1 - cosA) / (1 + cosA));
      const d0 = r / tanAHalf;
      if (d0 > dAB || d0 > dAC) {
        // invalid rounded corner will be ignored
        shapes.push(
          new PayloadLine(lastPoint, tmp_v, channelWidth, channelHeight)
        );
        addTransitionCircle(
          shapes,
          channel.channelDef[i].position[0],
          channel.channelDef[i].position[1],
          channel,
          z,
          i,
          channelHeight
        );
        lastPoint = tmp_v;
      } else {
        const ratio1 = d0 / dAB;
        const ratio2 = d0 / dAC;
        const p1 = [A[0] + AB[0] * ratio1, A[1] + AB[1] * ratio1];
        const p2 = [A[0] + AC[0] * ratio2, A[1] + AC[1] * ratio2];
        const arc_start = new Point(p1[0], p1[1], z);
        const arc_end = new Point(p2[0], p2[1], z);
        const P = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
        const ratio3 = (r / d0) ** 2 + 1;
        const AP = [P[0] - A[0], P[1] - A[1]];
        const c_x = A[0] + AP[0] * ratio3;
        const c_y = A[1] + AP[1] * ratio3;
        const arc_center = new Point(c_x, c_y, z);
        shapes.push(
          new PayloadLine(lastPoint, arc_start, channelWidth, channelHeight)
        );
        shapes.push(
          new PayloadCurve(
            arc_center,
            arc_start,
            arc_end,
            tmp_v,
            channelWidth,
            channelHeight
          )
        );
        lastPoint = arc_end;
      }
    } else {
      shapes.push(
        new PayloadLine(lastPoint, tmp_v, channelWidth, channelHeight)
      );
      addTransitionCircle(
        shapes,
        channel.channelDef[i].position[0],
        channel.channelDef[i].position[1],
        channel,
        z,
        i,
        channelHeight
      );
      lastPoint = tmp_v;
    }
  }
  return new PayloadChannel(shapes);
};

export { buildChannelPayload };
