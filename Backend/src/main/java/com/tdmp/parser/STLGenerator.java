package com.tdmp.parser;

import com.easyMF.Component;
import com.easyMF.Cuboid;
import com.tdmp.Chip;
import com.tdmp.channel.Channel;
import com.tdmp.crosslayer.CrossLayerConnection;
import com.tdmp.deserializer.RequestDeserializer;
import com.tdmp.layer.Layer;

import java.io.IOException;
import java.nio.ByteBuffer;

public class STLGenerator {


    private Component.Fetcher fetcher;
    private Component.Fetcher_binary fetcher_binary;
    private Component stlChip;

    private Chip chip;

    public STLGenerator(String json) {
        this.chip = RequestDeserializer.deserializeRequest(json);

        int slices;
        switch (chip.getPrecision()) {
            case High:
                slices = 64;
                break;
            case Medium:
                slices = 32;
                break;
            default:
                slices = 16;
        }

        stlChip = new Cuboid(chip.getLength(), chip.getWidth(), chip.getThickness());

        for (Layer layer : chip.getLayers()) {
            for (com.tdmp.component.Component component : layer.getComponents()) {
                stlChip = component.addToStlChip(stlChip, slices);
            }
            for(Channel channel : layer.getChannels()) {
                stlChip = channel.addToStlChip(stlChip, slices);
            }
        }

        for (CrossLayerConnection crossLayerConnection : chip.getCrossLayerConnections()) {
            stlChip = crossLayerConnection.addToStlChip(stlChip, slices);
        }
        fetcher = stlChip.new Fetcher("component", 0.001);
        fetcher_binary = stlChip.new Fetcher_binary(0.001);

    }

    public STLGenerator(Chip chip) {
        this.chip = chip;

        int slices;
        switch (chip.getPrecision()) {
            case High:
                slices = 64;
                break;
            case Medium:
                slices = 32;
                break;
            default:
                slices = 16;
        }

        stlChip = new Cuboid(chip.getLength(), chip.getWidth(), chip.getThickness());

        for (Layer layer : chip.getLayers()) {
            for (com.tdmp.component.Component component : layer.getComponents()) {
                stlChip = component.addToStlChip(stlChip, slices);
            }
            for(Channel channel : layer.getChannels()) {
                stlChip = channel.addToStlChip(stlChip, slices);
            }
        }

        for (CrossLayerConnection crossLayerConnection : chip.getCrossLayerConnections()) {
            stlChip = crossLayerConnection.addToStlChip(stlChip, slices);
        }
        fetcher = stlChip.new Fetcher("component", 0.001);
        fetcher_binary = stlChip.new Fetcher_binary(0.001);
    }

    public STLGenerator(Component stlChip) {
        this.stlChip = stlChip;
        fetcher = stlChip.new Fetcher("component", 0.001);
        fetcher_binary = stlChip.new Fetcher_binary(0.001);
    }

    public String next() {
        return fetcher.fetch();
    }

    public ByteBuffer next_binary() {
        return fetcher_binary.fetch();
    }

    public void toFile(String fileName) throws IOException {
        stlChip.toSTL(fileName, 0.001);
    }
    public void toBinFile(String fileName) throws IOException {
        stlChip.toSTL_binary(fileName, 0.001);
    }

    public void toFile_binary(String fileName) throws IOException {
        stlChip.toSTL_binary(fileName, 0.001);
    }

    public String stlToString() throws IOException {
        return stlChip.toSTL(0.001);
    }

    public byte[] stlToBytes() throws IOException {
        return stlChip.toSTL_binary(0.001);
    }

    public Chip getChip() {
        return chip;
    }

    public Component getStlChip() {
        return stlChip;
    }
}
