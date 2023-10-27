package com.easyMF;

import java.util.ArrayList;

public class Prism extends Component{  // deprecated
    static final double[][][] surroundings = {
            {{0, 0, 0}, {1, 0, 0}, {1, 0, 1}, {0, 0, 1}},
            {{0, 0, 0}, {0, 0, 1}, {0.5, Math.sqrt(3)/2, 1}, {0.5, Math.sqrt(3)/2, 0}},
            {{1, 0, 0}, {0.5, Math.sqrt(3)/2, 0}, {0.5, Math.sqrt(3)/2, 1}, {1, 0, 1}},
    };
    static final double[][][] tops = {
            {{0.5, Math.sqrt(3)/2, 0}, {1, 0, 0}, {0, 0, 0}},
            {{0, 0, 1}, {1, 0, 1}, {0.5, Math.sqrt(3)/2, 1}},
    };

    public Prism(double origin_x, double origin_y, double origin_z,
          double x_direc_x, double x_direc_y, double x_direc_z,
          double y_direc_x, double y_direc_y, double y_direc_z,
          double edge_length, double height,
          boolean _solid) throws IllegalArgumentException {
        solid = _solid;

        Vector3d x = new Vector3d(x_direc_x, x_direc_y, x_direc_z).normalize().scale(edge_length);
        Vector3d y = new Vector3d(y_direc_x, y_direc_y, y_direc_z).normalize().scale(edge_length);
        Vector3d origin = new Vector3d(origin_x, origin_y, origin_z);

        if (edge_length < Vector3d.EPS || height < Vector3d.EPS) {
            throw new IllegalArgumentException("Edge length or height is almost zero!");
        }

        if (Math.abs(x.dot(y)) > Vector3d.EPS) {
            throw new IllegalArgumentException("Direction Vectors are not perpendicular!");
        }

        Vector3d z = new Vector3d(x.cross(y));
        z = z.normalize().scale(height);

        ArrayList<Polygon> polygons = new ArrayList<>();

        for (double[][] one_case: surroundings) {
            ArrayList<Vector3d> points = new ArrayList<>();
            for (double[] indicator: one_case) {
                points.add(
                        origin.add(x.scale(indicator[0]))
                                .add(y.scale(indicator[1]))
                                .add(z.scale(indicator[2]))
                );
            }
            polygons.add(new Polygon(points));
        }
        for (double[][] one_case: tops) {
            ArrayList<Vector3d> points = new ArrayList<>();
            for (double[] indicator: one_case) {
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
