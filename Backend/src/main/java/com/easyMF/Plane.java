package com.easyMF;

import java.util.ArrayList;

class Plane {
    Vector3d normal;
    double dst;

    void call() {
        System.out.print("****Plane:\nnormal: \n");
        normal.call();
        System.out.print("dst: " + dst + "\n");
    }

    Plane(Plane other) {
        normal = new Vector3d(other.normal);
        dst = other.dst;
    }

    Plane(Vector3d _normal, double _dst) {
        normal = _normal.normalize();
        dst = _dst;
    }

    void inv() {
        normal = normal.inv();
        dst = -dst;
    }

    void split(Polygon polygon, ArrayList<Polygon> front_coplanar, ArrayList<Polygon> back_coplanar,
               ArrayList<Polygon> front, ArrayList<Polygon> back) {

        final byte r_coplanar = 0, r_front = 0b1, r_back = 0b10, r_cross = 0b11;
        ArrayList<Byte> relations = new ArrayList<>();
        byte relation = r_coplanar;

        for (Vector3d point: polygon.points) {
            double dst_diff = point.dot(normal) - dst;
            byte tmp_relation = r_coplanar;
            if (dst_diff > 1e-5) {
                tmp_relation = r_front;
            }
            else if (dst_diff < -1 * 1e-5) {
                tmp_relation = r_back;
            }
            relations.add(tmp_relation);
            relation |= tmp_relation;
        }

        switch (relation) {
            case r_front:
                front.add(polygon);
                break;
            case r_back:
                back.add(polygon);
                break;
            case r_cross:
                ArrayList<Vector3d> front_points = new ArrayList<>(), back_points = new ArrayList<>();
                for (int i = 0; i < polygon.points.size(); ++i) {
                    int j = (i + 1)%polygon.points.size();

                    Vector3d point_i = polygon.points.get(i);
                    Vector3d point_j = polygon.points.get(j);
                    byte relation_i = relations.get(i);
                    byte relation_j = relations.get(j);

                    if (relation_i != r_back) {
                        front_points.add(point_i);
                    }
                    if (relation_i != r_front) {
                        back_points.add(point_i);
                    }
                    if ((relation_i | relation_j) == r_cross) {
                        double ratio_j = (point_j.dot(normal)  - dst) / (point_j.dot(normal) - point_i.dot(normal));
                        assert ratio_j >= 0 : "ratio cannot < 0!";

                        Vector3d point_new = point_j.add(point_i.sub(point_j).scale(ratio_j));
                        front_points.add(point_new);
                        back_points.add(point_new);
                    }
                }
                assert !front_points.isEmpty() : "front_points cannot be empty!";
                assert !back_points.isEmpty() : "back_points cannot be empty!";

                front.add(new Polygon(front_points));
                back.add(new Polygon(back_points));
                break;

            default:
                double coplanar_checker = polygon.plane.normal.dot(normal);
                double sign = coplanar_checker > 0 ? 1 : -1;

                if (sign > 0) {
                    front_coplanar.add(polygon);
                }
                else {
                    back_coplanar.add(polygon);
                }
        }
    }

    void split(ArrayList<Polygon> _polygons, ArrayList<Polygon> front_coplanar, ArrayList<Polygon> back_coplanar,
               ArrayList<Polygon> front, ArrayList<Polygon> back) {
        for (Polygon polygon: _polygons) {
            split(polygon, front_coplanar, back_coplanar, front, back);
        }
    }
}
