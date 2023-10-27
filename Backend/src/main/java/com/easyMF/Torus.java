package com.easyMF;

import java.util.ArrayList;

public class Torus extends Component{
    public Torus(double center_x, double center_y, double center_z,
          double st_x, double st_y, double st_z,
          double tangent_x, double tangent_y, double tangent_z,
          double radius_tube, double proportion,
          int slices_ring, int slices_tube, boolean _solid) throws IllegalArgumentException {
    	build(center_x, center_y, center_z, st_x, st_y, st_z, tangent_x, tangent_y, tangent_z,
                radius_tube, proportion, slices_ring, slices_tube, _solid);
    }
    
    public Torus(double center_x, double center_y, double center_z,
            double st_x, double st_y, double st_z,
            double ed_x, double ed_y, double ed_z,
            double tangent_x, double tangent_y, double tangent_z,
            double radius_tube, int slices_ring, int slices_tube, boolean _solid) throws IllegalArgumentException {
    	Vector3d st = new Vector3d(st_x, st_y, st_z);
      	Vector3d ed = new Vector3d(ed_x, ed_y, ed_z);
      	Vector3d center = new Vector3d(center_x, center_y, center_z);
      	Vector3d tangent = new Vector3d(tangent_x, tangent_y, tangent_z);

        double proportion = st.sub(center).normalize().dot(ed.sub(center).normalize());
        proportion = Math.round(proportion * 100) / 100.0;
        proportion = proportion < - 1 ? -1 : proportion > 1 ? 1 : proportion;
        proportion = Math.acos(proportion);
        proportion = proportion / (2 * Math.PI);
    	//double proportion = Math.acos(st.sub(center).normalize().dot(ed.sub(center).normalize())) / (2 * Math.PI);
    	//boolean flag = ed.sub(st).normalize().dot(tangent.normalize()) < 0.5;
        boolean flag = Math.abs(Vector3d.computeAngle(center, st, ed)) > Math.PI/2;
    	if (flag) {
    		proportion = 1 - proportion;
    	}
    	
    	build(center_x, center_y, center_z, st_x, st_y, st_z, tangent_x, tangent_y, tangent_z,
                  radius_tube, proportion, slices_ring, slices_tube, _solid);
      }
    
    void build(double center_x, double center_y, double center_z,
            double st_x, double st_y, double st_z,
            double tangent_x, double tangent_y, double tangent_z,
            double radius_tube, double proportion,
            int slices_ring, int slices_tube, boolean _solid) throws IllegalArgumentException  {
    	slices_ring = (int)Math.ceil((double)slices_ring * proportion);
    	
    	solid = _solid;

        Vector3d center = new Vector3d(center_x, center_y, center_z);
        Vector3d st = new Vector3d(st_x, st_y, st_z);


        Vector3d x_direc = st.sub(center);
        double radius_ring = x_direc.norm();
        x_direc = x_direc.normalize();
        Vector3d y_direc = new Vector3d(tangent_x, tangent_y, tangent_z).normalize();
        Vector3d z_direc = x_direc.cross(y_direc).normalize();

        if (radius_ring < Vector3d.EPS || radius_tube < Vector3d.EPS) {
            throw new IllegalArgumentException("Radius of the ring or the tube is too small!");
        }
        if (radius_ring < radius_tube) {
            throw new IllegalArgumentException("Radius of the ring cannot be smaller than that of the tube!");
        }
        if (Math.abs(x_direc.dot(y_direc)) > Vector3d.EPS) {
            throw new IllegalArgumentException("Vector 'tangent' is not tangent to the radius of the ring at Point 'st'!");
        }
        if (proportion <= 0 || proportion > 1) {
            throw new IllegalArgumentException("Proportion has to be within range (0, 1]!");
        }

        ArrayList<Polygon> polygons = new ArrayList<>();
        double delta_theta_ring = proportion * Math.PI * 2 / slices_ring;
        double delta_theta_tube = Math.PI * 2 / slices_tube;

        ArrayList<Vector3d> points;
        Vector3d center_torus, x_direc_tube;
        for (int i = 0; i < slices_ring; ++i) {
            for (int j = 0; j < slices_tube; ++j) {
                points = new ArrayList<>();
                points.add(calc_pos(center, x_direc, y_direc, z_direc,
                        delta_theta_ring * i, delta_theta_tube * j,
                        radius_ring, radius_tube));
                Vector3d p = calc_pos(center, x_direc, y_direc, z_direc,
                        delta_theta_ring * (i + 1), delta_theta_tube * j,
                        radius_ring, radius_tube);
                if (!p.equal(points.get(points.size() - 1))) {
                    points.add(p);
                }
                points.add(calc_pos(center, x_direc, y_direc, z_direc,
                        delta_theta_ring * (i + 1), delta_theta_tube * (j + 1),
                        radius_ring, radius_tube));
                p = calc_pos(center, x_direc, y_direc, z_direc,
                        delta_theta_ring * i, delta_theta_tube * (j + 1),
                        radius_ring, radius_tube);
                if (!p.equal(points.get(points.size() - 1))) {
                    points.add(p);
                }
                polygons.add(new Polygon(points));

                if (proportion != 1 && i == 0) {
                    points = new ArrayList<>();
                    center_torus = st;
                    x_direc_tube = x_direc;

                    points.add(new Vector3d(center_torus));
                    points.add(calc_pos_2d(center_torus, x_direc_tube, z_direc, delta_theta_tube*(j), radius_tube));
                    points.add(calc_pos_2d(center_torus, x_direc_tube, z_direc, delta_theta_tube*(j + 1), radius_tube));
                    polygons.add(new Polygon(points));
                }

                if (proportion != 1 && i == slices_ring - 1) {
                    points = new ArrayList<>();
                    center_torus = calc_pos_2d(center, x_direc, y_direc, delta_theta_ring * slices_ring, radius_ring);
                    x_direc_tube = center_torus.sub(center).normalize();

                    points.add(new Vector3d(center_torus));
                    points.add(calc_pos_2d(center_torus, x_direc_tube, z_direc, delta_theta_tube*(j + 1), radius_tube));
                    points.add(calc_pos_2d(center_torus, x_direc_tube, z_direc, delta_theta_tube*(j), radius_tube));
                    polygons.add(new Polygon(points));
                }
            }
        }
        root = new BSPNode(polygons);
    }

    private static Vector3d calc_pos(Vector3d center, Vector3d x_direc, Vector3d y_direc, Vector3d z_direc,
                                     double phi, double theta, double radius_big, double radius_small) {
        return center.add(x_direc.scale((radius_big + radius_small * Math.cos(theta)) * Math.cos(phi)))
                .add(y_direc.scale((radius_big + radius_small * Math.cos(theta)) * Math.sin(phi)))
                .add(z_direc.scale(radius_small * Math.sin(theta)));
    }

    private static Vector3d calc_pos_2d(Vector3d center, Vector3d x_direc, Vector3d y_direc,
                                     double theta, double radius) {
        return center.add(x_direc.scale(radius * Math.cos(theta))).add(y_direc.scale(radius * Math.sin(theta)));
    }
}
