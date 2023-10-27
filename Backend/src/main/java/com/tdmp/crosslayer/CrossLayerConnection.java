package com.tdmp.crosslayer;

import com.tdmp.channel.Channel;
import com.tdmp.primitive.Shape;

import java.util.ArrayList;

public class CrossLayerConnection {

    private ArrayList<Shape> shapes;

    public void addShape(Shape shape) {
        shapes.add(shape);
    }

    public void removeShape(Shape shape) {
        shapes.remove(shape);
    }
    public Shape getShape(int index) {
        return shapes.get(index);
    }

    public ArrayList<Shape> getShapes() {
        return shapes;
    }

    public void setShapes(ArrayList<Shape> shapes) {
        this.shapes = shapes;
    }

    public com.easyMF.Component addToStlChip(com.easyMF.Component chip, int slices) {
        for(Shape shape : shapes) {
            chip = chip.add(shape.toStlCompotnent(slices));
        }
        return chip;
    }
}
