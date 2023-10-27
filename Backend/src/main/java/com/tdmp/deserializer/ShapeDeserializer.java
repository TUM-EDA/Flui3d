package com.tdmp.deserializer;

import com.google.gson.*;
import com.tdmp.primitive.Shape;

import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;

public class ShapeDeserializer implements JsonDeserializer<Shape>
{
    private String type;
    private Gson gson;
    private Map<String, Class<? extends Shape>> typeRegistry;

    public ShapeDeserializer(String shapeName) {
        this.typeRegistry = new HashMap<>();
        this.gson = new Gson();
        this.type = shapeName;
    }

    public void registerType(String name, Class<? extends Shape> type) {
        typeRegistry.put(name, type);
    }

    @Override
    public Shape deserialize(JsonElement jsonElement, Type type, JsonDeserializationContext jsonDeserializationContext) throws JsonParseException {
        JsonObject jsonObject = jsonElement.getAsJsonObject();
        String typeString = jsonObject.get(this.type).getAsString();
        Class<? extends Shape> typeClass = typeRegistry.get(typeString);
        return gson.fromJson(jsonObject, typeClass);
    }
}
