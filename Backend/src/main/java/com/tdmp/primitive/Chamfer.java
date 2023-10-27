package com.tdmp.primitive;

import com.easyMF.Component;
import com.easyMF.Inlet;

public class Chamfer extends Shape {

    private ThreeDimensionPoint center;
    private double radius;
    private double radius_top;

    public Chamfer(ThreeDimensionPoint center, double radius, double radius_top) {
        this.center = center;
        this.radius = radius;
        this.radius_top = radius_top;
        this.type = "Chamfer";
    }

    public ThreeDimensionPoint getCenter() {
        return center;
    }

    public void setCenter(ThreeDimensionPoint center) {
        this.center = center;
    }

    public double getRadius() {
        return radius;
    }

    public void setRadius(double radius) {
        this.radius = radius;
    }

    public double getRadius_top() {
        return radius_top;
    }

    public void setRadius_top(double radius_top) {
        this.radius_top = radius_top;
    }

    @Override
    public Component toStlCompotnent(int slices) {
        return new Inlet(center.x, center.y, center.z, height, radius, radius_top, slices, fill);
    }

    @Override
    public String toString() {
        return "Chamfer{" +
                "center=" + center +
                ", radius=" + radius +
                ", radius_top=" + radius_top +
                ", fill=" + fill +
                ", height=" + height +
                "} " + super.toString();
    }
}
