package com.tdmp.primitive;

import com.easyMF.Component;
import com.easyMF.Cuboid;

public class Line extends Shape {


    private ThreeDimensionPoint start;
    private ThreeDimensionPoint end;

    private double width;


    public double getWidth() {
        return width;
    }


    public void setWidth(double width) {
        this.width = width;
    }

    public Line(ThreeDimensionPoint start, ThreeDimensionPoint end) {
        this.start = start;
        this.end = end;
        this.type = "Line";
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

    @Override
    public Component toStlCompotnent(int slices) {
        return new Cuboid(start.x, start.y, start.z, end.x, end.y, end.z, width, height, fill);
    }

    @Override
    public String toString() {
        return "Line{" +
                "start=" + start +
                ", end=" + end +
                ", fill=" + fill +
                ", height=" + height +
                "} " + super.toString();
    }
}
