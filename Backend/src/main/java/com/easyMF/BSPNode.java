package com.easyMF;

import java.util.ArrayList;
//import java.util.Random;

class BSPNode {
    BSPNode front, back;
    Plane plane;
    ArrayList<Polygon> polygons;

    void visit() {
        if (front != null) {
            System.out.print("left:\n");
            front.visit();
        }
        System.out.print("self:\n");
        plane.call();
        if (back != null) {
            System.out.print("right:\n");
            back.visit();
        }
    }

    BSPNode(ArrayList<Polygon> _polygons) {
        build(_polygons);
    }

    void build(ArrayList<Polygon> _polygons) {
        if (_polygons == null) {
            return;
        }
        if (_polygons.isEmpty()) {
            return;
        }

        if (plane == null) {
//            Random generator = new Random();
//            plane = new Plane(_polygons.get(generator.nextInt(_polygons.size())).plane);
            plane = new Plane(_polygons.get(0).plane);
        }
        if (polygons == null) {
            polygons = new ArrayList<>();
        }
        ArrayList<Polygon> front_polygons = new ArrayList<>(), back_polygons = new ArrayList<>();
        plane.split(_polygons, polygons, polygons, front_polygons, back_polygons);

        if (front == null) {
            front = front_polygons.isEmpty() ? null : new BSPNode(front_polygons);
        }
        else {
            front.build(front_polygons);
        }
        if (back == null) {
            back = back_polygons.isEmpty() ? null : new BSPNode(back_polygons);
        }
        else {
            back.build(back_polygons);
        }
    }

    void inv() {
        plane.inv();

        BSPNode tmp = front;
        front = back;
        back = tmp;

        for (Polygon polygon: polygons) {
            polygon.inv();
        }

        if (front != null) {
            front.inv();
        }
        if (back != null) {
            back.inv();
        }
    }

    //remove all polygons from "_polygons" inside "this"
    ArrayList<Polygon> clipPolygons(ArrayList<Polygon> _polygons) {
        assert plane != null : "cannot use null plan to clip!";

        ArrayList<Polygon> front_polygons = new ArrayList<>(), back_polygons = new ArrayList<>();
        plane.split(_polygons, front_polygons, back_polygons, front_polygons, back_polygons);

        if (front != null) {
            front_polygons = front.clipPolygons(front_polygons);
        }
        if (back != null) {
            back_polygons = back.clipPolygons(back_polygons);
        }
        else {
            back_polygons = new ArrayList<>();
        }

        front_polygons.addAll(back_polygons);
        return front_polygons;
    }

    // remove all polygons inside "other" in the subtree rooted at "this"
    void clipTo(BSPNode other) {
        polygons = other.clipPolygons(polygons);
        if (front != null) {
            front.clipTo(other);
        }
        if (back != null) {
            back.clipTo(other);
        }
    }

    ArrayList<Polygon> getAllPolygons() {
        ArrayList<Polygon> ret = new ArrayList<>();

        for(Polygon polygon: polygons) {
            ret.add(new Polygon(polygon));
        }
        if (front != null) {
            ret.addAll(front.getAllPolygons());
        }
        if (back != null) {
            ret.addAll(back.getAllPolygons());
        }
        return ret;
    }
}
