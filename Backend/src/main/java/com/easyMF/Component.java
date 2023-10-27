package com.easyMF;

import java.io.*;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.channels.FileChannel;
import java.util.ArrayList;
import java.util.Arrays;

public class Component {
    BSPNode root;
    boolean solid;

    Component(BSPNode _root) {
        root = _root;
        solid = true;
    }

    Component() { }

    ArrayList<Polygon> getAllPolygons() {
        return root.getAllPolygons();
    }

    protected static class Triangle{
        Vector3d[] points;
        int cnt;
        Triangle() {
            points = new Vector3d[3];
            cnt = 0;
        }
        Polygon add(Vector3d point) {
            if (cnt < 2) {
                points[cnt++] = point;
                return null;
            }

            points[2] = point;

            Vector3d vec1 = points[2].sub(points[0]).normalize();
            Vector3d vec2 = points[1].sub(points[0]).normalize();

            if (vec1.cross(vec2).norm() < Vector3d.EPS) {
                points[1] = points[2];
                return null;
            }

            ArrayList<Vector3d> ret = new ArrayList<>();
            ret.add(new Vector3d(points[0]));
            ret.add(new Vector3d(points[1]));
            ret.add(new Vector3d(points[2]));
            points[1] = points[2];
            return new Polygon(ret);
        }
    }

    ArrayList<Polygon> triangulate() {
        ArrayList<Polygon> polygons = getAllPolygons();
        ArrayList<Polygon> triangles = new ArrayList<>();
        for (Polygon polygon: polygons) {
            Triangle triangle = new Triangle();
            for (Vector3d point: polygon.points) {
                Polygon result = triangle.add(point);
                if (result != null) {
                    triangles.add(result);
                }
            }
        }
        return triangles;
    }

    public void toSTL(String fileName, double unit_factor) throws IOException {
        FileWriter writer = new FileWriter(fileName);
        writer.write("solid " + fileName + "\n");

        ArrayList<Polygon> triangles = triangulate();
        for (Polygon triangle: triangles) {
            writer.write("facet normal ");
            Vector3d normal = triangle.plane.normal;
            writer.write(String.format("%.6e ", normal.x));
            writer.write(String.format("%.6e ", normal.y));
            writer.write(String.format("%.6e\n", normal.z));

            writer.write("outer loop\n");

            writer.write("vertex ");
            writer.write(String.format("%.6e ", triangle.points.get(0).x * unit_factor));
            writer.write(String.format("%.6e ", triangle.points.get(0).y * unit_factor));
            writer.write(String.format("%.6e\n", triangle.points.get(0).z * unit_factor));
            writer.write("vertex ");
            writer.write(String.format("%.6e ", triangle.points.get(1).x * unit_factor));
            writer.write(String.format("%.6e ", triangle.points.get(1).y * unit_factor));
            writer.write(String.format("%.6e\n", triangle.points.get(1).z * unit_factor));
            writer.write("vertex ");
            writer.write(String.format("%.6e ", triangle.points.get(2).x * unit_factor));
            writer.write(String.format("%.6e ", triangle.points.get(2).y * unit_factor));
            writer.write(String.format("%.6e\n", triangle.points.get(2).z * unit_factor));

            writer.write("endloop\n");
            writer.write("endfacet\n");
        }

        writer.write("endsolid " + fileName + "\n");
        writer.close();
    }

    public String toSTL(double unit_factor) throws IOException {
        StringWriter writer = new StringWriter();
        writer.write("solid component" + "\n");

        ArrayList<Polygon> triangles = triangulate();
        for (Polygon triangle: triangles) {
            writer.write("facet normal ");
            Vector3d normal = triangle.plane.normal;
            writer.write(String.format("%.6e ", normal.x));
            writer.write(String.format("%.6e ", normal.y));
            writer.write(String.format("%.6e\n", normal.z));

            writer.write("outer loop\n");

            writer.write("vertex ");
            writer.write(String.format("%.6e ", triangle.points.get(0).x * unit_factor));
            writer.write(String.format("%.6e ", triangle.points.get(0).y * unit_factor));
            writer.write(String.format("%.6e\n", triangle.points.get(0).z * unit_factor));
            writer.write("vertex ");
            writer.write(String.format("%.6e ", triangle.points.get(1).x * unit_factor));
            writer.write(String.format("%.6e ", triangle.points.get(1).y * unit_factor));
            writer.write(String.format("%.6e\n", triangle.points.get(1).z * unit_factor));
            writer.write("vertex ");
            writer.write(String.format("%.6e ", triangle.points.get(2).x * unit_factor));
            writer.write(String.format("%.6e ", triangle.points.get(2).y * unit_factor));
            writer.write(String.format("%.6e\n", triangle.points.get(2).z * unit_factor));

            writer.write("endloop\n");
            writer.write("endfacet\n");
        }
        writer.write("endsolid component");
        return writer.toString();
    }
    
    public void toSTL_binary(String fileName, double unit_factor) throws IOException {
    	FileOutputStream fos = new FileOutputStream(fileName);
    	FileChannel writer = fos.getChannel();
        ByteBuffer buf = ByteBuffer.allocate(1024);
        buf.order(ByteOrder.LITTLE_ENDIAN);

        byte[] header = new byte[80];
        byte[] filler = new byte[2];
        Arrays.fill(header, (byte)0);
        Arrays.fill(filler, (byte)0);
        
        buf.put(header);
        
        ArrayList<Polygon> triangles = triangulate();
        buf.putInt(triangles.size());
        
        buf.flip();
        writer.write(buf);
        
        for (Polygon triangle: triangles) {
        	buf.clear();
        	
            Vector3d normal = triangle.plane.normal;
            buf.putFloat((float)normal.x);
            buf.putFloat((float)normal.y);
            buf.putFloat((float)normal.z);

            buf.putFloat((float)(triangle.points.get(0).x * unit_factor));
            buf.putFloat((float)(triangle.points.get(0).y * unit_factor));
            buf.putFloat((float)(triangle.points.get(0).z * unit_factor));
            
            buf.putFloat((float)(triangle.points.get(1).x * unit_factor));
            buf.putFloat((float)(triangle.points.get(1).y * unit_factor));
            buf.putFloat((float)(triangle.points.get(1).z * unit_factor));

            buf.putFloat((float)(triangle.points.get(2).x * unit_factor));
            buf.putFloat((float)(triangle.points.get(2).y * unit_factor));
            buf.putFloat((float)(triangle.points.get(2).z * unit_factor));
            
            buf.put(filler);
            
            buf.flip();
            writer.write(buf);
        }
        fos.close();
    }

    public byte[] toSTL_binary(double unit_factor) throws IOException {
        OutputStream os = new ByteArrayOutputStream();

        ByteBuffer buf = ByteBuffer.allocate(1024);
        buf.order(ByteOrder.LITTLE_ENDIAN);

        byte[] header = new byte[80];
        byte[] filler = new byte[2];
        Arrays.fill(header, (byte)0);
        Arrays.fill(filler, (byte)0);

        buf.put(header);

        ArrayList<Polygon> triangles = triangulate();
        buf.putInt(triangles.size());

        buf.flip();

        byte[] bytes = new byte[buf.remaining()];
        buf.get(bytes, 0, bytes.length);
        os.write(bytes);

        for (Polygon triangle: triangles) {
            buf.clear();

            Vector3d normal = triangle.plane.normal;
            buf.putFloat((float)normal.x);
            buf.putFloat((float)normal.y);
            buf.putFloat((float)normal.z);

            buf.putFloat((float)(triangle.points.get(0).x * unit_factor));
            buf.putFloat((float)(triangle.points.get(0).y * unit_factor));
            buf.putFloat((float)(triangle.points.get(0).z * unit_factor));

            buf.putFloat((float)(triangle.points.get(1).x * unit_factor));
            buf.putFloat((float)(triangle.points.get(1).y * unit_factor));
            buf.putFloat((float)(triangle.points.get(1).z * unit_factor));

            buf.putFloat((float)(triangle.points.get(2).x * unit_factor));
            buf.putFloat((float)(triangle.points.get(2).y * unit_factor));
            buf.putFloat((float)(triangle.points.get(2).z * unit_factor));

            buf.put(filler);

            buf.flip();
            bytes = new byte[buf.remaining()];
            buf.get(bytes, 0, bytes.length);
            os.write(bytes);
        }
        return ((ByteArrayOutputStream)os).toByteArray();
    }
    
    public class Fetcher {
        int cnt;
        ArrayList<Polygon> triangles;
        String chipName;
        double unit_factor = 1;
        
        public Fetcher(String _chipName) {
            cnt = -1;
            triangles = triangulate();
            chipName = _chipName;
        }
        
        public Fetcher(String _chipName, double _unit_factor) {
            cnt = -1;
            triangles = triangulate();
            chipName = _chipName;
            unit_factor = _unit_factor;
        }
        
        public String fetch() {
        	if (cnt <= triangles.size()) {
        		if (cnt == -1) {
        			cnt++;
        			return "solid " + chipName + "\n";
        		}
        		else if (cnt == triangles.size()) {
        			cnt++;
        			return "endsolid " + chipName + "\n";
        		}
        		else {
        			Polygon triangle = triangles.get(cnt);
        			cnt++;
        			String ret = new String();
        			ret += "facet normal ";
                    Vector3d normal = triangle.plane.normal;
                    ret += String.format("%.6e ", normal.x);
                    ret += String.format("%.6e ", normal.y);
                    ret += String.format("%.6e\n", normal.z);

                    ret += "outer loop\n";

                    ret += "vertex ";
                    ret += String.format("%.6e ", triangle.points.get(0).x * unit_factor);
                    ret += String.format("%.6e ", triangle.points.get(0).y * unit_factor);
                    ret += String.format("%.6e\n", triangle.points.get(0).z * unit_factor);
                    ret += "vertex ";
                    ret += String.format("%.6e ", triangle.points.get(1).x * unit_factor);
                    ret += String.format("%.6e ", triangle.points.get(1).y * unit_factor);
                    ret += String.format("%.6e\n", triangle.points.get(1).z * unit_factor);
                    ret += "vertex ";
                    ret += String.format("%.6e ", triangle.points.get(2).x * unit_factor);
                    ret += String.format("%.6e ", triangle.points.get(2).y * unit_factor);
                    ret += String.format("%.6e\n", triangle.points.get(2).z * unit_factor);

                    ret += "endloop\n";
                    ret += "endfacet\n";
                    
                    return ret;
        		}
        	}
        	else {
        		return null;
        	}
        }
    }
    
    public class Fetcher_binary {
        int cnt;
        ArrayList<Polygon> triangles;
        double unit_factor = 1;
        
        public Fetcher_binary() {
            cnt = -1;
            triangles = triangulate();
        }
        
        public Fetcher_binary(double _unit_factor) {
            cnt = -1;
            triangles = triangulate();
            unit_factor = _unit_factor;
        }
        
        public ByteBuffer fetch() {
    		ByteBuffer buf = ByteBuffer.allocate(1024);
            buf.order(ByteOrder.LITTLE_ENDIAN);
    		
        	if (cnt == -1) {
        		++cnt;
                byte[] header = new byte[80];
                Arrays.fill(header, (byte)0);
                
                buf.put(header);
                
                ArrayList<Polygon> triangles = triangulate();
                buf.putInt(triangles.size());
                
                buf.flip();
                return buf;
        	}
        	
        	else if (cnt < triangles.size()) {
                byte[] filler = new byte[2];
                Arrays.fill(filler, (byte)0);
                
        		Polygon triangle = triangles.get(cnt);
    			++cnt;
    			
    			Vector3d normal = triangle.plane.normal;
                buf.putFloat((float)normal.x);
                buf.putFloat((float)normal.y);
                buf.putFloat((float)normal.z);

                buf.putFloat((float)(triangle.points.get(0).x * unit_factor));
                buf.putFloat((float)(triangle.points.get(0).y * unit_factor));
                buf.putFloat((float)(triangle.points.get(0).z * unit_factor));
                
                buf.putFloat((float)(triangle.points.get(1).x * unit_factor));
                buf.putFloat((float)(triangle.points.get(1).y * unit_factor));
                buf.putFloat((float)(triangle.points.get(1).z * unit_factor));

                buf.putFloat((float)(triangle.points.get(2).x * unit_factor));
                buf.putFloat((float)(triangle.points.get(2).y * unit_factor));
                buf.putFloat((float)(triangle.points.get(2).z * unit_factor));
                
                buf.put(filler);
                
                buf.flip();
                
                return buf;
        	}
        	else {
        		return null;
        	}
        }
    }

    Component union(Component other) {
        BSPNode a = new BSPNode(getAllPolygons()), b = new BSPNode(other.getAllPolygons());
        a.clipTo(b);
        b.clipTo(a);
        b.inv();
        b.clipTo(a);
        b.inv();
        a.build(b.getAllPolygons());
        return new Component(a);
    }

    Component sub(Component other) {
        BSPNode a = new BSPNode(getAllPolygons()), b = new BSPNode(other.getAllPolygons());
        a.inv();
        a.clipTo(b);
        b.clipTo(a);
        b.inv();
        b.clipTo(a);
        b.inv();
        a.build(b.getAllPolygons());
        a.inv();
        return new Component(a);
    }

    public Component add(Component other) {
        if (!solid) {
            throw new ArithmeticException("first operand has to be solid!");
        }
        if (other.solid) {
            return this.union(other);
        }
        return this.sub(other);
    }
}
