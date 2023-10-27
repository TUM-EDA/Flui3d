package com.tdmp.channel;

import com.tdmp.primitive.Curve;
import com.tdmp.primitive.Line;
import com.tdmp.primitive.Shape;

import java.util.ArrayList;

public class Channel {



    private ArrayList<Shape> shapes;

    public Channel() {

    }

    private void addShape(Shape shape) {
        shapes.add(shape);
    }

    private void removeShape(Shape shape) {
        shapes.remove(shape);
    }

    public ArrayList<Shape> getShapes() {
        return shapes;
    }

    public void setShapes(ArrayList<Shape> shapes) {
        this.shapes = shapes;
    }

    public com.easyMF.Component addToStlChip(com.easyMF.Component chip, int slices) {
        for(Shape shape : shapes) {
            //shape.setFill(false);
            //TODO: Change
/*            if(shape.getClass() == com.tdmp.primitive.Line.class) {
                ((Line)shape).setWidth(width);
                ((Line)shape).setHeight(height);
               //System.out.println(width);
            }if(shape.getClass() == com.tdmp.primitive.Curve.class) {
                ((Curve)shape).setWidth(width);
                ((Curve)shape).setHeight(height);
            }*/


            chip = chip.add(shape.toStlCompotnent(slices));
        }
        return chip;
    }

    @Override
    public String toString() {
        return "Channel{" +
                "shapes=" + shapes +
                '}';
    }
}
