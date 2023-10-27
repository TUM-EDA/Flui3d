<template>
  <div class="w-100 overflow-auto">
    <div id="stl-preview" class="px-0 mx-auto" style="width: 1000px"></div>
  </div>
</template>
<script>
import { useContentStore } from "@/stores/content";
import { useControlStore } from "@/stores/control";
import { defineComponent, onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
export default defineComponent({
  setup() {
    const controlStore = useControlStore();
    const contentStore = useContentStore();
    function isBinary(data) {
      const reader = new DataView(data);
      const face_size = (32 / 8) * 3 + (32 / 8) * 3 * 3 + 16 / 8;
      const n_faces = reader.getUint32(80, true);
      const expect = 80 + 32 / 8 + n_faces * face_size;

      if (expect === reader.byteLength) {
        return true;
      } // An ASCII STL data must begin with 'solid ' as the first six bytes.
      // However, ASCII STLs lacking the SPACE after the 'd' are known to be
      // plentiful.  So, check the first 5 bytes for 'solid'.
      // Several encodings, such as UTF-8, precede the text with up to 5 bytes:
      // https://en.wikipedia.org/wiki/Byte_order_mark#Byte_order_marks_by_encoding
      // Search for "solid" to start anywhere after those prefixes.
      // US-ASCII ordinal values for 's', 'o', 'l', 'i', 'd'

      const solid = [115, 111, 108, 105, 100];

      for (let off = 0; off < 5; off++) {
        // If "solid" text is matched to the current offset, declare it to be an ASCII STL.
        if (solid[off] !== reader.getUint8(off)) return true;
      } // Couldn't find "solid" text at the beginning; it is binary STL.

      return false;
    }

    function parseBinary(data) {
      const reader = new DataView(data);
      const faces = reader.getUint32(80, true);
      let r,
        g,
        b,
        hasColors = false;

      // check for default color in header ("COLOR=rgba" sequence).
      let index = 0;
      while (index < 70) {
        if (
          reader.getUint32(index, false) == 0x434f4c4f &&
          /*COLO*/
          reader.getUint8(index + 4) == 0x52 &&
          /*'R'*/
          reader.getUint8(index + 5) == 0x3d
          /*'='*/
        )
          break;
        ++index;
      }

      hasColors = true;
      const colors = new Float32Array(faces * 3 * 3);

      // process STL header
      const defaultR = reader.getUint8(index + 6) / 255;
      const defaultG = reader.getUint8(index + 7) / 255;
      const defaultB = reader.getUint8(index + 8) / 255;
      //   const alpha = reader.getUint8(index + 9) / 255;

      const dataOffset = 84;
      const faceLength = 12 * 4 + 2;
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array(faces * 3 * 3);
      const normals = new Float32Array(faces * 3 * 3);

      for (let face = 0; face < faces; face++) {
        const start = dataOffset + face * faceLength;
        const normalX = reader.getFloat32(start, true);
        const normalY = reader.getFloat32(start + 4, true);
        const normalZ = reader.getFloat32(start + 8, true);
        r = defaultR;
        g = defaultG;
        b = defaultB;

        if (hasColors) {
          const packedColor = reader.getUint16(start + 48, true);
          if ((packedColor & 0x8000) === 0) {
            // facet has its own unique color
            r = (packedColor & 0x1f) / 31;
            g = ((packedColor >> 5) & 0x1f) / 31;
            b = ((packedColor >> 10) & 0x1f) / 31;
          }
        }

        for (let i = 1; i <= 3; i++) {
          const vertexstart = start + i * 12;
          const componentIdx = face * 3 * 3 + (i - 1) * 3;
          vertices[componentIdx] = reader.getFloat32(vertexstart, true);
          vertices[componentIdx + 1] = reader.getFloat32(vertexstart + 4, true);
          vertices[componentIdx + 2] = reader.getFloat32(vertexstart + 8, true);
          normals[componentIdx] = normalX;
          normals[componentIdx + 1] = normalY;
          normals[componentIdx + 2] = normalZ;

          if (hasColors) {
            colors[componentIdx] = r;
            colors[componentIdx + 1] = g;
            colors[componentIdx + 2] = b;
          }
        }
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
      geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));

      if (hasColors) {
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        // geometry.hasColors = true;
        // geometry.alpha = alpha;
      }

      return geometry;
    }

    function parseASCII(data) {
      const geometry = new THREE.BufferGeometry();
      const patternSolid = /solid([\s\S]*?)endsolid/g;
      const patternFace = /facet([\s\S]*?)endfacet/g;
      let faceCounter = 0;
      const patternFloat = /[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/
        .source;
      const patternVertex = new RegExp(
        "vertex" + patternFloat + patternFloat + patternFloat,
        "g"
      );
      const patternNormal = new RegExp(
        "normal" + patternFloat + patternFloat + patternFloat,
        "g"
      );
      const vertices = [];
      const normals = [];
      const normal = new THREE.Vector3();
      let result;
      let groupCount = 0;
      let startVertex = 0;
      let endVertex = 0;
      while ((result = patternSolid.exec(data)) !== null) {
        startVertex = endVertex;
        const solid = result[0];
        while ((result = patternFace.exec(solid)) !== null) {
          let vertexCountPerFace = 0;
          let normalCountPerFace = 0;
          const text = result[0];
          while ((result = patternNormal.exec(text)) !== null) {
            normal.x = parseFloat(result[1]);
            normal.y = parseFloat(result[2]);
            normal.z = parseFloat(result[3]);
            normalCountPerFace++;
          }
          while ((result = patternVertex.exec(text)) !== null) {
            vertices.push(
              parseFloat(result[1]),
              parseFloat(result[2]),
              parseFloat(result[3])
            );
            normals.push(normal.x, normal.y, normal.z);
            vertexCountPerFace++;
            endVertex++;
          } // every face have to own ONE valid normal

          if (normalCountPerFace !== 1) {
            console.error(
              "THREE.STLLoader: Something isn't right with the normal of face number " +
                faceCounter
            );
          } // each face have to own THREE valid vertices

          if (vertexCountPerFace !== 3) {
            console.error(
              "THREE.STLLoader: Something isn't right with the vertices of face number " +
                faceCounter
            );
          }
          faceCounter++;
        }

        const start = startVertex;
        const count = endVertex - startVertex;
        geometry.addGroup(start, count, groupCount);
        groupCount++;
      }

      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
      );
      geometry.setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(normals, 3)
      );
      return geometry;
    }

    function ensureString(buffer) {
      if (typeof buffer !== "string") {
        return THREE.LoaderUtils.decodeText(new Uint8Array(buffer));
      }
      return buffer;
    }

    function ensureBinary(buffer) {
      if (typeof buffer === "string") {
        const array_buffer = new Uint8Array(buffer.length);
        for (let i = 0; i < buffer.length; i++) {
          array_buffer[i] = buffer.charCodeAt(i) & 0xff; // implicitly assumes little-endian
        }
        return array_buffer.buffer || array_buffer;
      } else {
        return buffer;
      }
    } // start
    const parseSTL = (data) => {
      const binData = ensureBinary(data);
      return isBinary(binData)
        ? parseBinary(binData)
        : parseASCII(ensureString(data));
    };

    const addMaterialAndRender = (geometry) => {
      const scene = new THREE.Scene();

      let width = 1000,
        height = 720;
      let k = width / height;
      let material1 = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      let mesh = new THREE.Mesh(geometry, material1);
      scene.add(mesh);

      // let edge = new THREE.EdgesGeometry(mesh.geometry); // or WireframeGeometry
      // let lines = new THREE.LineSegments(
      //   edge,
      //   new THREE.LineBasicMaterial({ color: 0xffffff })
      // );
      // mesh.add(lines);

      const light1 = new THREE.PointLight(0xffffff);
      light1.position.set(-500, 1000, 0);
      scene.add(light1);
      const light2 = new THREE.PointLight(0x444444);
      light2.position.set(500, -500, 100);
      scene.add(light2);

      // let material2 = new THREE.MeshLambertMaterial({
      //   color: 0xfafafa,
      //   transparent: true,
      //   opacity: 0.5,
      //   side: THREE.FrontSide,
      //   depthTest: false,
      //   depthWrite: false,
      // });
      // scene.add(new THREE.Mesh(geometry, material2));

      // scene.add(new THREE.AmbientLight(0x444444));
      // let point = new THREE.PointLight(0xffffff);
      // point.position.set(400, 200, 300);
      // let point2 = new THREE.PointLight(0xffffff);
      // point2.position.set(-400, -200, -300);
      // scene.add(point);
      // scene.add(point2);
      // let ambient = new THREE.AmbientLight(0x444444);
      // scene.add(ambient);

      // const ambient = new THREE.AmbientLight(0x404040); // soft white light
      // scene.add(ambient);
      const camera = new THREE.PerspectiveCamera(55, k, 1, 10000);
      camera.position.set(200, 500, 800);
      camera.lookAt(scene.position);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setClearColor(0xdddddd, 1);

      let container = document.getElementById("stl-preview");
      if (container.childNodes.length > 0) {
        container.replaceChild(renderer.domElement, container.childNodes[0]);
      } else {
        container.append(renderer.domElement);
      }

      renderer.render(scene, camera);
      let controls = new OrbitControls(camera, renderer.domElement);
      controls.addEventListener("change", () => {
        renderer.render(scene, camera);
      });
    };
    const init = () => {
      console.log("preview mounted");

      const geometry = parseSTL(contentStore.stlData);
      geometry.center();
      geometry.scale(20, 20, 20);
      // console.log(geometry);
      addMaterialAndRender(geometry);
    };

    onMounted(init);

    return { controlStore, contentStore };
  }
});
</script>
