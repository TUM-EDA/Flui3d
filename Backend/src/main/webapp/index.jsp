<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="com.tdmp.*" %>
<%@ page import="java.util.Locale" %>
<%@ page import="java.nio.ByteBuffer" %>
<%@ page import="com.tdmp.parser.STLGenerator" %>
<%@ page trimDirectiveWhitespaces="true" %>
<%
    Locale.setDefault(new Locale("en", "EN"));
    String json = request.getParameter("chip");
    try {
        //response.setContentType("application/octet-stream");
        response.setContentType("model/stl");
        response.setHeader("Content-Disposition", "attachment;filename=\"MFChip.stl\"");
        //System.out.println(json);
        STLGenerator stl = new STLGenerator(json);
        //System.out.println(request.getParameter("binary") );
        if (request.getParameter("binary") != null && request.getParameter("binary").equals("true")) {
            response.getOutputStream().write(stl.stlToBytes());
        } else {
            response.getOutputStream().print(stl.stlToString());
        }

        response.getOutputStream().flush();
        response.getOutputStream().close();
/*        ByteBuffer bb = stl.next_binary();
        while (bb != null) {
            byte[] b = new byte[bb.remaining()];
            bb.get(b);
            response.getOutputStream().write(b);
            response.getOutputStream().flush();
            bb = stl.next_binary();
        }*/

        response.setStatus(200);

    } catch (Exception e) {
        response.sendError(400, "Error during parsing the JSON file: " + e.getMessage());
        System.err.println("Error during parsing the JSON file: " + e.getMessage());
    }

%>