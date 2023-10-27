package com.tdmp.deserializer;

import com.google.gson.*;
import com.google.gson.reflect.TypeToken;
import com.tdmp.Chip;
import com.tdmp.Precision;
import com.tdmp.channel.Channel;
import com.tdmp.component.Component;
import com.tdmp.crosslayer.CrossLayerConnection;
import com.tdmp.layer.Layer;
import com.tdmp.primitive.*;

import java.lang.reflect.Type;
import java.util.ArrayList;

public class RequestDeserializer {

    public static ArrayList<Shape> deserializeShapes(JsonArray json) {
        Type listOfShapes = new TypeToken<ArrayList<Shape>>() {
        }.getType();

        RuntimeTypeAdapterFactory<Shape> adapter = RuntimeTypeAdapterFactory.of(Shape.class, "type")
                .registerSubtype(Chamfer.class, "Chamfer")
                .registerSubtype(Circle.class, "Circle")
                .registerSubtype(Curve.class, "Curve")
                .registerSubtype(Polygon.class, "Polygon")
                .registerSubtype(Line.class, "Line");


        Gson gson = new GsonBuilder().registerTypeAdapterFactory(adapter).create();

        ArrayList<Shape> shapeList = gson.fromJson(json, listOfShapes);

        return shapeList;
    }

    public static ArrayList<Layer> deserializeLayers(JsonArray json) {
       ArrayList<Layer> layers = new ArrayList<>();
        for(JsonElement layer : json) {
            JsonObject layerObject = layer.getAsJsonObject();
            layers.add(deserializeLayer(layerObject));
        }
        return layers;
    }
    public static Layer deserializeLayer(JsonObject json) {
        Layer ret = new Layer();
        int elevation = json.get("elevation").getAsInt();
        ret.setElevation(elevation);
        ret.setComponents(deserializeComponents(json.get("components").getAsJsonArray()));
        ret.setChannels(deserializeChannels(json.get("channels").getAsJsonArray()));
        if(json.has("compensation")) {
            Component compensation = new Component();
            compensation.setId("compensation");
            JsonArray shapes = new JsonArray();
            shapes.add(json.get("compensation").getAsJsonObject());
            compensation.setShapes(deserializeShapes(shapes));
            compensation.setChannels(new ArrayList<>());
            ret.getComponents().add(compensation);
        }
        return ret;
    }

    public static ArrayList<Component> deserializeComponents(JsonArray json){
        ArrayList<Component> ret = new ArrayList<>();

        for(JsonElement jo:json){
            Component c = deserializeComponent(jo.getAsJsonObject());
            ret.add(c);
        }

        return ret;
    }
    public static Component deserializeComponent(JsonObject json) {
        Component ret = new Component();
        String id = json.get("id").getAsString();
        ret.setId(id);
        JsonArray shapes = json.get("shapes").getAsJsonArray();
        ret.setShapes(deserializeShapes(shapes));
        ret.setChannels(deserializeChannels(json.get("channels").getAsJsonArray()));

        //TODO: setPorts

        return ret;
    }

    public static ArrayList<Channel> deserializeChannels(JsonArray json) {
        ArrayList<Channel> ret = new ArrayList<>();

        for(JsonElement jo:json){
            Channel c = deserializeChannel(jo.getAsJsonObject());
            ret.add(c);
        }

        return ret;
    }
    public static Channel deserializeChannel(JsonObject json) {
/*        int height = json.get("height").getAsInt();
        int width = json.get("width").getAsInt();*/

        Channel ret = new Channel();

        ret.setShapes(deserializeShapes(json.get("shapes").getAsJsonArray()));

        return ret;
    }

    public static ArrayList<CrossLayerConnection> deserializeCrossLayerConnections(JsonArray json) {
        ArrayList<CrossLayerConnection> ret = new ArrayList<>();

        for(JsonElement jo:json){
            CrossLayerConnection c = deserializeCrossLayerConnection(jo.getAsJsonObject());
            ret.add(c);
        }

        return ret;
    }
    public static CrossLayerConnection deserializeCrossLayerConnection(JsonObject json) {
        CrossLayerConnection ret = new CrossLayerConnection();
        ret.setShapes(deserializeShapes(json.get("shapes").getAsJsonArray()));
        return ret;
    }

    public static Chip deserializeRequest(String json) {
        Chip ret = new Chip();
        JsonObject jsonObject =JsonParser.parseString(json).getAsJsonObject();
        ret.setWidth(jsonObject.get("general").getAsJsonObject().get("width").getAsInt());
        ret.setLength(jsonObject.get("general").getAsJsonObject().get("length").getAsInt());
        ret.setThickness(jsonObject.get("general").getAsJsonObject().get("thickness").getAsInt());
        Gson gson = new Gson();
        Precision p = gson.fromJson(jsonObject.get("general").getAsJsonObject().get("precision"), Precision.class);
        ret.setPrecision(p);

        ret.setLayers(deserializeLayers(jsonObject.get("layers").getAsJsonArray()));
        ret.setCrossLayerConnections(deserializeCrossLayerConnections(jsonObject.get("crosslayerConnections").getAsJsonArray()));
        return ret;
    }




}
