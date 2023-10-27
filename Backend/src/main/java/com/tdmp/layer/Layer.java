package com.tdmp.layer;


import com.tdmp.channel.Channel;
import com.tdmp.component.Component;

import java.util.ArrayList;

public class Layer {
    private int elevation;
    private ArrayList<Component> components;
    private ArrayList<Channel> channels;

    public int getElevation() {
        return elevation;
    }

    public void setElevation(int elevation) {
        this.elevation = elevation;
    }

    public ArrayList<Component> getComponents() {
        return components;
    }

    public void setComponents(ArrayList<Component> components) {
        this.components = components;
    }

    public ArrayList<Channel> getChannels() {
        return channels;
    }

    public void setChannels(ArrayList<Channel> channels) {
        this.channels = channels;
    }

    @Override
    public String toString() {
        return "Layer{" +
                "elevation=" + elevation +
                ", components=" + components +
                ", channels=" + channels +
                '}';
    }
}
