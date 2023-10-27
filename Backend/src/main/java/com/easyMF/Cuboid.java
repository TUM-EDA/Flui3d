package com.easyMF;

import java.util.ArrayList;

public class Cuboid extends Component{
    static final int[][][] all_cases = {
            {{0, 0, 0}, {1, 0, 0}, {1, 0, 1}, {0, 0, 1}},
            {{0, 0, 0}, {0, 0, 1}, {0, 1, 1}, {0, 1, 0}},
            {{0, 1, 0}, {1, 1, 0}, {1, 0, 0}, {0, 0, 0}},
            {{0, 1, 1}, {1, 1, 1}, {1, 1, 0}, {0, 1, 0}},
            {{1, 1, 0}, {1, 1, 1}, {1, 0, 1}, {1, 0, 0}},
            {{0, 0, 1}, {1, 0, 1}, {1, 1, 1}, {0, 1, 1}},
    };

    public Cuboid(double origin_x, double origin_y, double origin_z,
           double x_direc_x, double x_direc_y, double x_direc_z,
           double y_direc_x, double y_direc_y, double y_direc_z,
           double z_direc_len,
           boolean _solid) throws IllegalArgumentException {  // general
        solid = _solid;

        Vector3d x = new Vector3d(x_direc_x, x_direc_y, x_direc_z);
        Vector3d y = new Vector3d(y_direc_x, y_direc_y, y_direc_z);
        Vector3d origin = new Vector3d(origin_x, origin_y, origin_z);

        if (x.norm() < Vector3d.EPS || y.norm() < Vector3d.EPS || z_direc_len < Vector3d.EPS) {
            throw new IllegalArgumentException("Edge length is almost zero!");
        }

        if (Math.abs(x.dot(y)) > Vector3d.EPS) {
            throw new IllegalArgumentException("Direction Vectors are not perpendicular!");
        }

        Vector3d z = new Vector3d(x.cross(y));
        z = z.normalize().scale(z_direc_len);

        build(x, y, z, origin);
    }

    public Cuboid(double x_len, double y_len, double z_len) throws IllegalArgumentException {  // chip
        solid = true;

        if (x_len < Vector3d.EPS || y_len < Vector3d.EPS || z_len < Vector3d.EPS) {
            throw new IllegalArgumentException("Edge length is almost zero!");
        }
        Vector3d x = new Vector3d(x_len, 0, 0);
        Vector3d y = new Vector3d(0, y_len, 0);
        Vector3d z = new Vector3d(0, 0, z_len);
        Vector3d origin = new Vector3d(0, 0, 0);

        build(x, y, z, origin);
    }

    public Cuboid(double origin_x, double origin_y, double origin_z,
           double x_len, double y_len, double z_len,
           boolean _solid) throws IllegalArgumentException {  // cuboid with all axes parallel to the global axes
        solid = _solid;

        if (x_len < Vector3d.EPS || y_len < Vector3d.EPS || z_len < Vector3d.EPS) {
            throw new IllegalArgumentException("Edge length is almost zero!");
        }
        Vector3d x = new Vector3d(x_len, 0, 0);
        Vector3d y = new Vector3d(0, y_len, 0);
        Vector3d z = new Vector3d(0, 0, z_len);
        Vector3d origin = new Vector3d(origin_x, origin_y, origin_z);

        build(x, y, z, origin);
    }
    
    public Cuboid(double st_x, double st_y, double st_z,
            double ed_x, double ed_y, double ed_z,
            double width, double height, boolean _solid) throws IllegalArgumentException {  // for cuboid pipes: given the start and end coords of its two ends 
         solid = _solid;

         Vector3d st = new Vector3d(st_x, st_y, st_z);
         Vector3d ed = new Vector3d(ed_x, ed_y, ed_z);
         if (width < Vector3d.EPS || height < Vector3d.EPS || ed.sub(st).norm() < Vector3d.EPS) {
             throw new IllegalArgumentException("Edge length is almost zero!");
         }
         
         Vector3d z = new Vector3d(0, 0, 1);
         Vector3d y = ed.sub(st);
         z = z.sub(y.normalize().scale(y.normalize().dot(z))).normalize();
         z = z.scale(height);
         Vector3d x = y.cross(z).normalize().scale(width);
         Vector3d origin = st.sub(z.scale(0.5)).sub(x.scale(0.5));

         build(x, y, z, origin);
     }

    void build(Vector3d x, Vector3d y, Vector3d z, Vector3d origin) {
        ArrayList<Polygon> polygons = new ArrayList<>();

        for (int[][] one_case: all_cases) {
            ArrayList<Vector3d> points = new ArrayList<>();
            for (int[] indicator: one_case) {
                points.add(
                        origin.add(x.scale(indicator[0]))
                                .add(y.scale(indicator[1]))
                                .add(z.scale(indicator[2]))
                );
            }
            polygons.add(new Polygon(points));
        }

        root = new BSPNode(polygons);
    }
}
