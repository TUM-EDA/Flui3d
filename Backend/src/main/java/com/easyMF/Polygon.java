package com.easyMF;

import java.util.ArrayList;

class Polygon {
    ArrayList<Vector3d> points;
    Plane plane;

    void call() {
        System.out.print("**Polygon:\n");
        plane.call();
        for (Vector3d point: points) {
            point.call();
        }
    }

    Polygon(ArrayList<Vector3d> _points) throws IllegalArgumentException {
        points = _points;

        Vector3d norm, vec1, vec2;
        vec1 = points.get(1).sub(points.get(0)).normalize();
        int i;
        for (i = 2; i < points.size(); ++i) {
            vec2 = (points.get(i).sub(points.get(0))).normalize();
            if (vec1.cross(vec2).norm() >= Vector3d.EPS) {
                break;
            }
        }
        if (i >= points.size()) {
            throw new IllegalArgumentException("No enough points for a polygon!");
        }

        vec2 = points.get(i).sub(points.get(0)).normalize();
        norm = vec1.cross(vec2).normalize();

        double dst = points.get(0).dot(norm);
        plane = new Plane(norm, dst);
    }

    Polygon(Polygon other) {
        plane = new Plane(other.plane);
        points = new ArrayList<>();
        for (Vector3d point: other.points) {
            points.add(new Vector3d(point));
        }
    }

    void inv() {
        plane.inv();
        ArrayList<Vector3d> tmp = new ArrayList<>();
        for (int i = points.size() - 1; i >=0; --i) {
            tmp.add(new Vector3d(points.get(i)));
        }
        points = tmp;
    }
}
