package com.easyMF;

import java.util.ArrayList;

public class SquareRing extends Component{
    public SquareRing(double center_x, double center_y, double center_z,
          double st_x, double st_y, double st_z,
          double tangent_x, double tangent_y, double tangent_z,
          double tube_width, double tube_height, double proportion,
          int slices_ring, boolean _solid) throws IllegalArgumentException {
    	build(center_x, center_y, center_z, st_x, st_y, st_z, tangent_x, tangent_y, tangent_z,
    	          tube_width, tube_height, proportion, slices_ring, _solid);
    }
    
    public SquareRing(double center_x, double center_y, double center_z,
            double st_x, double st_y, double st_z,
            double ed_x, double ed_y, double ed_z,
            double tangent_x, double tangent_y, double tangent_z,
            double tube_width, double tube_height, int slices_ring, boolean _solid) throws IllegalArgumentException {
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
      	          tube_width, tube_height, proportion, slices_ring, _solid);
      }
    
    void build(double center_x, double center_y, double center_z,
            double st_x, double st_y, double st_z,
            double tangent_x, double tangent_y, double tangent_z,
            double tube_width, double tube_height, double proportion,
            int slices_ring, boolean _solid){
    	slices_ring = (int)Math.ceil((double)slices_ring * proportion);
    	
        solid = _solid;

        Vector3d center = new Vector3d(center_x, center_y, center_z);
        Vector3d st = new Vector3d(st_x, st_y, st_z);

        Vector3d x_direc = st.sub(center);
        double radius_ring = x_direc.norm();
        x_direc = x_direc.normalize();
        Vector3d y_direc = new Vector3d(tangent_x, tangent_y, tangent_z).normalize();
        Vector3d z_direc = x_direc.cross(y_direc).normalize();

        if (radius_ring < Vector3d.EPS) {
            throw new IllegalArgumentException("Radius of the ring is too small!");
        }
        if (tube_height < Vector3d.EPS || tube_width < Vector3d.EPS) {
            throw new IllegalArgumentException("The tube is is too thin!");
        }
        if (radius_ring < tube_width / 2.d) {
            throw new IllegalArgumentException("Radius of the ring cannot be smaller than half width of the tube!");
        }
        if (Math.abs(x_direc.dot(y_direc)) > Vector3d.EPS) {
        	throw new IllegalArgumentException("Vector 'tangent' is not tangent to the radius of the ring at Point 'st'!");
        }
        if (proportion <= 0 || proportion > 1) {
            throw new IllegalArgumentException("Proportion has to be within range (0, 1]!");
        }

        if (proportion == 1) {
            Vector3d half_height = z_direc.normalize().scale(tube_height / 2.d);
            Vector3d cylinder_st = center.sub(half_height);
            Vector3d cylinder_ed = center.add(half_height);
            Cylinder outer = new Cylinder(cylinder_st.x, cylinder_st.y, cylinder_st.z, cylinder_ed.x, cylinder_ed.y, cylinder_ed.z,
                    radius_ring + tube_width / 2.d, slices_ring, true);
            if (radius_ring == tube_width / 2.d) {
                root = outer.root;
            }
            else {
                Cylinder inner = new Cylinder(cylinder_st.x, cylinder_st.y, cylinder_st.z, cylinder_ed.x, cylinder_ed.y, cylinder_ed.z,
                        radius_ring - tube_width / 2.d, slices_ring, false);
                root = outer.add(inner).root;
            }
        }
        else {
            double delta_theta_ring = proportion * Math.PI * 2 / slices_ring;
            ArrayList<Double> coordinates = new ArrayList<>();
            Vector3d drag_direction = z_direc.scale(tube_height);
            Component ret = null;
            if (tube_width / 2.d == radius_ring) {
                Vector3d base = center.sub(z_direc.scale(tube_height / 2.d));
                coordinates.add(base.x);
                coordinates.add(base.y);
                coordinates.add(base.z);

                Vector3d last = center.add(x_direc.scale((radius_ring + tube_width/2.d) * Math.cos(slices_ring * delta_theta_ring)))
                        .add(y_direc.scale((radius_ring + tube_width/2.d) * Math.sin(slices_ring * delta_theta_ring)))
                        .sub(z_direc.scale(tube_height/2.d));
                coordinates.add(last.x);
                coordinates.add(last.y);
                coordinates.add(last.z);

                coordinates.add(0.d);coordinates.add(0.d);coordinates.add(0.d);
                for (int i = slices_ring - 1; i >= 0; --i) {
                    Vector3d tmp_point = center.add(x_direc.scale((radius_ring + tube_width/2.d) * Math.cos(i * delta_theta_ring)))
                            .add(y_direc.scale((radius_ring + tube_width/2.d) * Math.sin(i * delta_theta_ring)))
                            .sub(z_direc.scale(tube_height/2.d));
                    coordinates.set(6, tmp_point.x);
                    coordinates.set(7, tmp_point.y);
                    coordinates.set(8, tmp_point.z);
                    if (ret == null) {
                        ret = new Draggable(coordinates, drag_direction.x, drag_direction.y, drag_direction.z, true);
                    }
                    else {
                        ret = ret.add(new Draggable(coordinates, drag_direction.x, drag_direction.y, drag_direction.z, true));
                    }
                    last = tmp_point;
                    coordinates.set(3, last.x);
                    coordinates.set(4, last.y);
                    coordinates.set(5, last.z);
                }
            }
            else {
                Vector3d last_inner = center.add(x_direc.scale((radius_ring - tube_width/2.d) * Math.cos(0 * delta_theta_ring)))
                        .add(y_direc.scale((radius_ring - tube_width/2.d) * Math.sin(0 * delta_theta_ring)))
                        .sub(z_direc.scale(tube_height/2.d));
                Vector3d last_outer = center.add(x_direc.scale((radius_ring + tube_width/2.d) * Math.cos(0 * delta_theta_ring)))
                        .add(y_direc.scale((radius_ring + tube_width/2.d) * Math.sin(0 * delta_theta_ring)))
                        .sub(z_direc.scale(tube_height/2.d));

                for (int i = 1; i <= slices_ring; ++i) {
                    Vector3d inner = center.add(x_direc.scale((radius_ring - tube_width/2.d) * Math.cos(i * delta_theta_ring)))
                            .add(y_direc.scale((radius_ring - tube_width/2.d) * Math.sin(i * delta_theta_ring)))
                            .sub(z_direc.scale(tube_height/2.d));
                    Vector3d outer = center.add(x_direc.scale((radius_ring + tube_width/2.d) * Math.cos(i * delta_theta_ring)))
                            .add(y_direc.scale((radius_ring + tube_width/2.d) * Math.sin(i * delta_theta_ring)))
                            .sub(z_direc.scale(tube_height/2.d));
                    coordinates = new ArrayList<>();
                    coordinates.add(last_inner.x);
                    coordinates.add(last_inner.y);
                    coordinates.add(last_inner.z);
                    coordinates.add(inner.x);
                    coordinates.add(inner.y);
                    coordinates.add(inner.z);
                    coordinates.add(outer.x);
                    coordinates.add(outer.y);
                    coordinates.add(outer.z);
                    coordinates.add(last_outer.x);
                    coordinates.add(last_outer.y);
                    coordinates.add(last_outer.z);

                    if (ret == null) {
                        ret = new Draggable(coordinates, drag_direction.x, drag_direction.y, drag_direction.z, true);
                    }
                    else {
                        ret = ret.add(new Draggable(coordinates, drag_direction.x, drag_direction.y, drag_direction.z, true));
                    }
                    last_inner = inner;
                    last_outer = outer;
                }
            }
            assert ret != null;
            root = ret.root;
        }
    }
}
