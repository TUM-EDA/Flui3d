package com.tdmp.primitive;


import com.easyMF.Component;
import com.easyMF.Cylinder;

public class Circle extends Shape{


    private double radius;
    private ThreeDimensionPoint center;

    public Circle() {
        this.radius = 0;
        this.center = new ThreeDimensionPoint(0, 0, 0);
        this.type = "Circle";
    }

    public Circle(double radius, ThreeDimensionPoint center) {
        this.radius = radius;
        this.center = center;
        this.type = "Circle";
    }

    public double getRadius() {
        return radius;
    }

    public void setRadius(double radius) {
        this.radius = radius;
    }

    @Override
    public Component toStlCompotnent(int slices) {
        return new Cylinder(center.x, center.y, center.z, height, radius, slices, fill);
    }

    @Override
    public String toString() {
        return "Circle{" +
                "radius=" + radius +
                ", center=" + center +
                ", fill=" + fill +
                ", height=" + height +
                "} " + super.toString();
    }

    public ThreeDimensionPoint getCenter() {
        return center;
    }

    public void setCenter(ThreeDimensionPoint center) {
        this.center = center;
    }
}
