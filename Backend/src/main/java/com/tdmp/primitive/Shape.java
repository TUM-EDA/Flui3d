package com.tdmp.primitive;


public abstract class Shape {
    public boolean fill = false;
    public double height;
    public String type = "Shape";

    public boolean isFill() {
        return fill;
    }

    public void setFill(boolean fill) {
        this.fill = fill;
    }

    public double getHeight() {
        return height;
    }

    public void setHeight(double height) {
        this.height = height;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }


    public abstract com.easyMF.Component toStlCompotnent(int slices);



    @Override
    public String toString() {
        return "Shape{" +
                "fill=" + fill +
                ", height=" + height +
                ", type='" + type + '\'' +
                '}';
    }
}
