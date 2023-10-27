package com.tdmp.primitive;

import com.easyMF.Component;
import com.easyMF.Draggable;

import java.util.ArrayList;
import java.util.Arrays;

public class Polygon extends Shape {


    private ThreeDimensionPoint[] points;
    private ThreeDimensionPoint direction;

    public Polygon(ThreeDimensionPoint[] points) {
        this.points = points;
        this.type = "Polygon";
    }

    public ThreeDimensionPoint[] getPoints() {
        return points;
    }

    public ThreeDimensionPoint getDirection() {
        return direction;
    }

    public void setDirection(ThreeDimensionPoint direction) {
        this.direction = direction;
    }

    public void setPoints(ThreeDimensionPoint[] points) {
        this.points = points;
    }

    @Override
    public Component toStlCompotnent(int slices) {
        ArrayList<Double> coords = new ArrayList<>();

        for (ThreeDimensionPoint point : points) {
            coords.add(point.getX());
            coords.add(point.getY());
            coords.add(point.getZ());
        }

        Draggable draggable = new Draggable(coords, direction.x, direction.y, direction.z, fill);

        return draggable;
    }

    @Override
    public String toString() {
        return "Polygon{" +
                "points=" + Arrays.toString(points) +
                ", fill=" + fill +
                ", height=" + height ;
    }
}
