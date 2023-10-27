package com.tdmp;

import com.tdmp.crosslayer.CrossLayerConnection;
import com.tdmp.layer.Layer;

import java.util.ArrayList;

public class Chip {
    private ArrayList<Layer> layers;
    private int length;
    private int width;
    private int thickness;
    private Precision precision;

    private ArrayList<CrossLayerConnection> crossLayerConnections;

    public ArrayList<CrossLayerConnection> getCrossLayerConnections() {
        return crossLayerConnections;
    }

    public void setCrossLayerConnections(ArrayList<CrossLayerConnection> crossLayerConnections) {
        this.crossLayerConnections = crossLayerConnections;
    }

    public ArrayList<Layer> getLayers() {
        return layers;
    }

    public void setLayers(ArrayList<Layer> layers) {
        this.layers = layers;
    }

    public int getLength() {
        return length;
    }

    public void setLength(int length) {
        this.length = length;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getThickness() {
        return thickness;
    }

    public void setThickness(int thickness) {
        this.thickness = thickness;
    }

    public Precision getPrecision() {
        return precision;
    }

    public void setPrecision(Precision precision) {
        this.precision = precision;
    }

    @Override
    public String toString() {
        return "Chip{" +
                "layers=" + layers +
                ", length=" + length +
                ", width=" + width +
                ", thickness=" + thickness +
                ", precision=" + precision +
                ", crossLayerConnections=" + crossLayerConnections +
                '}';
    }
}
