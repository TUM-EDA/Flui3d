package com.easyMF;

import java.util.ArrayList;

public class Draggable extends Component{
    public Draggable(ArrayList<Double> point_coordinates,
              double drag_direc_x, double drag_direc_y,double drag_direc_z,
              boolean _solid) throws IllegalArgumentException {  // point_coordinates: clockwise, with rEPSect to the inverse of the drag-direction
        solid = _solid;

        Vector3d drag_direc = new Vector3d(drag_direc_x, drag_direc_y, drag_direc_z);

        if (drag_direc.norm() < Vector3d.EPS) {
            throw new IllegalArgumentException("Drag distance is too small!");
        }
        if (point_coordinates.size() % 3 != 0 || point_coordinates.size() < 9) {
            throw new IllegalArgumentException("Size of the point_coordinates has to be a multiple of 3 and at least 9!");
        }

        build(point_coordinates, drag_direc);
    }

    public Draggable(ArrayList<Double> point_coordinates, double dist, boolean _solid) throws IllegalArgumentException {  // drag along positive direction of z-axis
        solid = _solid;

        if (dist < Vector3d.EPS) {
            throw new IllegalArgumentException("Drag distance is too small!");
        }
        if (point_coordinates.size() % 3 != 0 || point_coordinates.size() < 9) {
            throw new IllegalArgumentException("Size of the point_coordinates has to be a multiple of 3 and at least 9!");
        }

        Vector3d drag_direc = new Vector3d(0, 0, dist);

        build(point_coordinates, drag_direc);
    }

    void build(ArrayList<Double> point_coordinates, Vector3d drag_direc) throws IllegalArgumentException {
        ArrayList<Vector3d> points = new ArrayList<>();
        Vector3d point0 = new Vector3d(point_coordinates.get(0), point_coordinates.get(1), point_coordinates.get(2));
        Vector3d point1 = new Vector3d(point_coordinates.get(3), point_coordinates.get(4), point_coordinates.get(5));
        Vector3d point2 = new Vector3d(point_coordinates.get(6), point_coordinates.get(7), point_coordinates.get(8));
        Vector3d normal = point1.sub(point0).cross(point2.sub(point0)).normalize();

        if (Math.abs(drag_direc.dot(normal)) < Vector3d.EPS) {
            throw new IllegalArgumentException("Drag direction is parallel to the points plane!");
        }

        for (int i = 0; i < point_coordinates.size() / 3; ++i) {
            Vector3d point = new Vector3d(point_coordinates.get(3 * i), point_coordinates.get(3 * i + 1), point_coordinates.get(3 * i + 2));
            points.add(point);
            if (Math.abs(point.sub(point0).dot(normal)) > Vector3d.EPS) {
                throw new IllegalArgumentException("Points are not on the same plane!");
            }
        }

        ArrayList<Vector3d> shiftedPoints = drag_direc.broadcastAdd(points);

        if (drag_direc.dot(normal) > 0) {
            points = Vector3d.inverse(points);
        }
        else {
            shiftedPoints = Vector3d.inverse(shiftedPoints);
        }


        ArrayList<Polygon> polygons = new ArrayList<>();
        polygons.add(new Polygon(points));
        polygons.add(new Polygon(shiftedPoints));

        ArrayList<Vector3d> gangOfFour;
        for (int i = 0; i < points.size(); ++i) {
            gangOfFour = new ArrayList<>();
            gangOfFour.add(points.get((i + 1) % points.size()));
            gangOfFour.add(points.get(i));
            gangOfFour.add(shiftedPoints.get(points.size() - 1 - i));
            gangOfFour.add(shiftedPoints.get(points.size() - 1 - (i + 1) % points.size()));
            polygons.add(new Polygon(gangOfFour));
        }

        root = new BSPNode(polygons);
    }
}
