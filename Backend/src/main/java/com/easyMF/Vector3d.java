package com.easyMF;

import java.util.ArrayList;

class Vector3d {
    double x;
    double y;
    double z;

    void call() {
        System.out.print("******Point:\n" + x + " " + y + " " + z + "\n");
    }

    Vector3d(double coordinateX, double coordinateY, double coordinateZ) {
        x = coordinateX;
        y = coordinateY;
        z = coordinateZ;
    }

    Vector3d(Vector3d other) {
        x = other.x;
        y = other.y;
        z = other.z;
    }

    Vector3d() {
        x = 0;
        y = 0;
        z = 0;
    }

    static final double EPS = 1e-10;

//    boolean lessThanAll(Vector3d other) {
//        return x < other.x && y < other.y && z < other.z;
//    }
//    boolean lessEqualAll(Vector3d other) {
//        return x <= other.x && y <= other.y && z <= other.z;
//    }
//    boolean lessThanAny(Vector3d other) {
//        return x < other.x || y < other.y || z < other.z;
//    }
//    boolean lessEqualAny(Vector3d other) {
//        return x <= other.x || y <= other.y || z <= other.z;
//    }
//
//    boolean greaterThanALL(Vector3d other) {
//        return x > other.x && y > other.y && z > other.z;
//    }
//    boolean greaterEqualALL(Vector3d other) {
//        return x >= other.x && y >= other.y && z >= other.z;
//    }
//    boolean greaterThanAny(Vector3d other) {
//        return x > other.x || y > other.y || z > other.z;
//    }
//    boolean greaterEqualAny(Vector3d other) {
//        return x >= other.x || y >= other.y || z >= other.z;
//    }

    Vector3d add(Vector3d other) {
        return new Vector3d(x + other.x, y + other.y, z + other.z);
    }

    Vector3d sub(Vector3d other) {
        return new Vector3d(x - other.x, y - other.y, z - other.z);
    }

    double dot(Vector3d other) {
        return x*other.x + y*other.y + z*other.z;
    }
    Vector3d cross(Vector3d other) {
        return new Vector3d(y*other.z - z*other.y,
                z*other.x - x*other.z,
                x*other.y - y*other.x);
    }

    double norm() {
        return Math.sqrt(x*x + y*y + z*z);
    }
    Vector3d scale(double alpha) {
        return new Vector3d(x*alpha, y*alpha, z*alpha);
    }
    Vector3d elementWiseScale(Vector3d other) {
        return new Vector3d(x*other.x, y*other.y, z*other.z);
    }

    Vector3d normalize() throws ArithmeticException{
        double denominator = norm();
        if (denominator < EPS) {
            throw new ArithmeticException("Cannot normalize a zero vector!");
        }
        return new Vector3d(scale(1d/norm()));
    }
    Vector3d inv() {
        return new Vector3d(-x, -y, -z);
    }

//    double min() {
//        return Math.min(Math.min(x, y), z);
//    }
//    double max() {
//        return Math.max(Math.max(x, y), z);
//    }
//    double absMin() {
//        return Math.min(Math.min(Math.abs(x), Math.abs(y)), Math.abs(z));
//    }
//    double absMax() {
//        return Math.max(Math.max(Math.abs(x), Math.abs(y)), Math.abs(z));
//    }
    boolean equal(Vector3d other) {
        return Math.abs(x - other.x) < EPS &&
                Math.abs(y - other.y) < EPS &&
                Math.abs(z - other.z) < EPS;
    }
    ArrayList<Vector3d> broadcastAdd(ArrayList<Vector3d> points) {
        ArrayList<Vector3d> ret = new ArrayList<>();
        for (Vector3d point: points) {
            ret.add(point.add(this));
        }
        return ret;
    }
    static ArrayList<Vector3d> inverse(ArrayList<Vector3d> points) {
        ArrayList<Vector3d> ret = new ArrayList<>();
        for (int i = points.size() - 1; i >= 0; --i) {
            ret.add(points.get(i));
        }
        return ret;
    }
    public static Vector3d createVector(Vector3d p0, Vector3d p1) {

        return new Vector3d(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z);
    }

    /**
     * Find the angle between three points. P0 is center point
     * @param p0 is center point
     * @param p1 is start point
     * @param p2 is end point
     * @return the radians of angle
     */
    public static double computeAngle(Vector3d p0, Vector3d p1, Vector3d p2) {
        Vector3d v0 = createVector(p0, p1);
        Vector3d v1 = createVector(p0, p2);

        double dotProduct = v1.dot(v1);

        double length1 = length(v0);
        double length2 = length(v1);

        double denominator = length1 * length2;

        double product = denominator != 0.0 ? dotProduct / denominator
                : 0.0;

        double angle = Math.acos(product);

        return angle;
    }
    public static double length(Vector3d v) {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }
}
