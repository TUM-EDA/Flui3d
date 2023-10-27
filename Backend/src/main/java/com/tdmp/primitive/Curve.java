package com.tdmp.primitive;

import com.easyMF.Component;
import com.easyMF.SquareRing;

public class Curve extends Shape {


    private ThreeDimensionPoint start;
    private ThreeDimensionPoint end;
    private ThreeDimensionPoint center;
    private ThreeDimensionPoint tangent;

    private double width;

    public double getWidth() {
        return width;
    }

    public void setWidth(double width) {
        this.width = width;
    }

    public Curve(ThreeDimensionPoint start, ThreeDimensionPoint end, ThreeDimensionPoint center, ThreeDimensionPoint tangent) {
        this.start = start;
        this.end = end;
        this.center = center;
        this.tangent = tangent;
        this.type = "Curve";
    }

    public ThreeDimensionPoint getStart() {
        return start;
    }

    public void setStart(ThreeDimensionPoint start) {
        this.start = start;
    }

    public ThreeDimensionPoint getEnd() {
        return end;
    }

    public void setEnd(ThreeDimensionPoint end) {
        this.end = end;
    }

    public ThreeDimensionPoint getCenter() {
        return center;
    }

    public void setCenter(ThreeDimensionPoint center) {
        this.center = center;
    }

    public ThreeDimensionPoint getTangent() {
        return tangent;
    }

    public void setTangent(ThreeDimensionPoint tangent) {
        this.tangent = tangent;
    }

    @Override
    public Component toStlCompotnent(int slices) {
        return new SquareRing(center.x, center.y, center.z, start.x, start.y, start.z,
                end.x, end.y, end.z, tangent.x, tangent.y, tangent.z, width, height, slices, fill);
    }

    @Override
    public String toString() {
        return "Curve{" +
                "start=" + start +
                ", end=" + end +
                ", center=" + center +
                ", tangent=" + tangent +
                ", fill=" + fill +
                ", height=" + height +
                "} " + super.toString();
    }

}
