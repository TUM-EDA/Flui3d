package com.easyMF;

import java.util.ArrayList;

public class Inlet extends Component{

    public Inlet(double st_x, double st_y, double st_z,
          double ed_x, double ed_y, double ed_z,
          double radius_st, double radius_ed, int slices, boolean _solid) throws IllegalArgumentException {  // general
        solid = _solid;

        Vector3d st = new Vector3d(st_x, st_y, st_z);
        Vector3d ed = new Vector3d(ed_x, ed_y, ed_z);
        Vector3d h = ed.sub(st);

        if (h.norm() < Vector3d.EPS || radius_st < Vector3d.EPS || radius_ed < Vector3d.EPS) {
            throw new IllegalArgumentException("Inlet is too short or too thin!");
        }

        build(st, ed, h, radius_st, radius_ed, slices);
    }

    public Inlet(double st_x, double st_y, double st_z,
          double height, double radius_st, double radius_ed, int slices, boolean _solid) throws IllegalArgumentException {  // height along z-axis
        solid = _solid;

        Vector3d st = new Vector3d(st_x, st_y, st_z);
        Vector3d ed = new Vector3d(st_x, st_y, st_z + height);
        Vector3d h = ed.sub(st);

        if (h.norm() < Vector3d.EPS || radius_st < Vector3d.EPS || radius_ed < Vector3d.EPS) {
            throw new IllegalArgumentException("Inlet is too short or too thin!");
        }


        build(st, ed, h, radius_st, radius_ed, slices);
    }

    void build(Vector3d st, Vector3d ed, Vector3d h, double radius_st, double radius_ed, int slices) {
        Vector3d z_direc = h.normalize();
        Vector3d x_direc = new Vector3d(1, 0, 0);
        if (Math.abs(x_direc.dot(z_direc)) < Vector3d.EPS ||
                Math.abs(x_direc.dot(z_direc)) > 1 - Vector3d.EPS) {
            x_direc = new Vector3d(0, 1, 0);
        }
        x_direc = x_direc.sub(z_direc.scale(x_direc.dot(z_direc))).normalize();
        Vector3d y_direc = z_direc.cross(x_direc);

        ArrayList<Polygon> polygons = new ArrayList<>();
        double delta_theta = Math.PI * 2 / slices;

        for (int i = 0; i < slices; ++i) {
            ArrayList<Vector3d> points = new ArrayList<>();
            points.add(new Vector3d(st));
            points.add(calc_pos(st, x_direc, y_direc, delta_theta*(i + 1), radius_st));
            points.add(calc_pos(st, x_direc, y_direc, delta_theta*(i), radius_st));
            polygons.add(new Polygon(points));

            points = new ArrayList<>();
            points.add(new Vector3d(ed));
            points.add(calc_pos(ed, x_direc, y_direc, delta_theta*(i), radius_ed));
            points.add(calc_pos(ed, x_direc, y_direc, delta_theta*(i + 1), radius_ed));
            polygons.add(new Polygon(points));

            points = new ArrayList<>();
            points.add(calc_pos(st, x_direc, y_direc, delta_theta*(i + 1), radius_st));
            points.add(calc_pos(ed, x_direc, y_direc, delta_theta*(i + 1), radius_ed));
            points.add(calc_pos(ed, x_direc, y_direc, delta_theta*(i), radius_ed));
            points.add(calc_pos(st, x_direc, y_direc, delta_theta*(i), radius_st));
            polygons.add(new Polygon(points));
        }

        root = new BSPNode(polygons);
    }

    private static Vector3d calc_pos(Vector3d center, Vector3d x_direc, Vector3d y_direc,
                                     double theta, double radius) {
        return center.add(x_direc.scale(radius * Math.cos(theta))).add(y_direc.scale(radius * Math.sin(theta)));
    }
}
