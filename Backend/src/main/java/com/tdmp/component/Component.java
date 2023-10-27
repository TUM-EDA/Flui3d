package com.tdmp.component;

import com.tdmp.channel.Channel;
import com.tdmp.primitive.Shape;

import java.util.ArrayList;

public class Component {
    private String id;
    private ArrayList<Shape> shapes;
    //private ArrayList<Object> ports;
    private ArrayList<Channel> channels;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ArrayList<Shape> getShapes() {
        return shapes;
    }

    public void setShapes(ArrayList<Shape> shapes) {
        this.shapes = shapes;
    }

    public ArrayList<Channel> getChannels() {
        return channels;
    }

    public void setChannels(ArrayList<Channel> channels) {
        this.channels = channels;
    }
    public com.easyMF.Component addToStlChip(com.easyMF.Component chip, int slices) {
        for(Shape shape : shapes) {
            chip = chip.add(shape.toStlCompotnent(slices));
        }
        for(Channel channel : channels) {
            chip = channel.addToStlChip(chip, slices);
        }
        return chip;
    }

    @Override
    public String toString() {
        return "Component{" +
                "id='" + id + '\'' +
                ", shapes=" + shapes +
                ", channels=" + channels +
                '}';
    }
}
